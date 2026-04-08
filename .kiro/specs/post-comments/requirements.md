# Document d'exigences — Commentaires sur les publications

## Introduction

Cette fonctionnalité permet aux utilisateurs authentifiés d'ajouter des commentaires aux publications dans leur fil d'actualité. Les commentaires enrichissent l'interaction sociale en permettant des conversations autour des publications. La fonctionnalité couvre la création, la consultation et la suppression de commentaires, ainsi que la mise à jour en temps réel du compteur de commentaires sur chaque publication.

## Glossaire

- **Système_Commentaires** : Ensemble des composants backend (Lambda, DynamoDB) responsables de la gestion des commentaires
- **Interface_Commentaires** : Composants frontend React permettant l'affichage et la saisie des commentaires
- **Publication** : Un article court (post) créé par un utilisateur, stocké dans la table Posts de DynamoDB
- **Commentaire** : Un texte court associé à une publication et à un auteur, stocké dans la table Comments de DynamoDB
- **Utilisateur_Authentifié** : Un utilisateur connecté disposant d'un token JWT valide
- **Compteur_Commentaires** : Attribut `commentsCount` de la table Posts, reflétant le nombre de commentaires associés
- **API_Commentaires** : Endpoints REST exposés via API Gateway pour les opérations CRUD sur les commentaires

## Exigences

### Exigence 1 : Créer un commentaire

**User Story :** En tant qu'utilisateur authentifié, je souhaite ajouter un commentaire à une publication, afin de pouvoir interagir avec le contenu des autres utilisateurs.

#### Critères d'acceptation

1. WHEN un Utilisateur_Authentifié soumet un commentaire avec un contenu non vide sur une Publication existante, THE Système_Commentaires SHALL créer un enregistrement dans la table Comments contenant l'identifiant du commentaire, l'identifiant de la publication, l'identifiant de l'utilisateur, le contenu, et un horodatage de création.
2. WHEN un Commentaire est créé avec succès, THE Système_Commentaires SHALL incrémenter le Compteur_Commentaires de la Publication associée de 1.
3. WHEN un Utilisateur_Authentifié soumet un commentaire dont le contenu dépasse 280 caractères, THE Système_Commentaires SHALL rejeter la requête avec un code HTTP 400 et un message d'erreur descriptif.
4. WHEN un Utilisateur_Authentifié soumet un commentaire avec un contenu vide ou composé uniquement d'espaces, THE Système_Commentaires SHALL rejeter la requête avec un code HTTP 400 et un message d'erreur descriptif.
5. WHEN un Utilisateur_Authentifié soumet un commentaire sur une Publication inexistante, THE Système_Commentaires SHALL rejeter la requête avec un code HTTP 404 et un message d'erreur descriptif.
6. IF un utilisateur non authentifié tente de créer un commentaire, THEN THE Système_Commentaires SHALL rejeter la requête avec un code HTTP 401.

### Exigence 2 : Consulter les commentaires d'une publication

**User Story :** En tant qu'utilisateur authentifié, je souhaite consulter les commentaires d'une publication, afin de lire les réactions des autres utilisateurs.

#### Critères d'acceptation

1. WHEN un Utilisateur_Authentifié demande les commentaires d'une Publication existante, THE Système_Commentaires SHALL retourner la liste des Commentaires triés par date de création du plus ancien au plus récent.
2. WHEN la liste de commentaires dépasse 20 éléments, THE Système_Commentaires SHALL paginer les résultats et fournir un jeton de pagination pour récupérer la page suivante.
3. WHEN un Utilisateur_Authentifié demande les commentaires d'une Publication sans commentaires, THE Système_Commentaires SHALL retourner une liste vide avec un code HTTP 200.
4. THE Système_Commentaires SHALL inclure pour chaque Commentaire retourné : l'identifiant du commentaire, le contenu, l'identifiant de l'auteur, le nom d'affichage de l'auteur, et la date de création.

### Exigence 3 : Supprimer un commentaire

**User Story :** En tant qu'utilisateur authentifié, je souhaite supprimer mes propres commentaires, afin de pouvoir retirer un commentaire que je ne souhaite plus afficher.

#### Critères d'acceptation

1. WHEN un Utilisateur_Authentifié demande la suppression d'un Commentaire dont il est l'auteur, THE Système_Commentaires SHALL supprimer le Commentaire de la table Comments.
2. WHEN un Commentaire est supprimé avec succès, THE Système_Commentaires SHALL décrémenter le Compteur_Commentaires de la Publication associée de 1.
3. WHEN un Utilisateur_Authentifié tente de supprimer un Commentaire dont il n'est pas l'auteur, THE Système_Commentaires SHALL rejeter la requête avec un code HTTP 403 et un message d'erreur descriptif.
4. WHEN un Utilisateur_Authentifié tente de supprimer un Commentaire inexistant, THE Système_Commentaires SHALL rejeter la requête avec un code HTTP 404 et un message d'erreur descriptif.

### Exigence 4 : Interface utilisateur des commentaires

**User Story :** En tant qu'utilisateur authentifié, je souhaite voir et ajouter des commentaires directement depuis le fil d'actualité, afin d'interagir sans quitter la page.

#### Critères d'acceptation

1. WHEN un Utilisateur_Authentifié clique sur le compteur de commentaires d'une Publication, THE Interface_Commentaires SHALL afficher la section de commentaires sous la Publication concernée.
2. THE Interface_Commentaires SHALL afficher un champ de saisie de texte permettant à l'Utilisateur_Authentifié de rédiger un nouveau commentaire.
3. WHEN un Utilisateur_Authentifié soumet un commentaire via le champ de saisie, THE Interface_Commentaires SHALL envoyer la requête à l'API_Commentaires et mettre à jour la liste des commentaires affichés sans rechargement de page.
4. WHEN un commentaire est créé avec succès, THE Interface_Commentaires SHALL mettre à jour le Compteur_Commentaires affiché sur la Publication.
5. THE Interface_Commentaires SHALL afficher pour chaque Commentaire le nom d'affichage de l'auteur (sous forme de lien vers son profil), le contenu, et la date de création formatée.
6. WHILE la section de commentaires est ouverte et contient plus de 20 commentaires, THE Interface_Commentaires SHALL permettre le chargement des commentaires suivants via un mécanisme de pagination.
7. WHEN un Utilisateur_Authentifié est l'auteur d'un Commentaire, THE Interface_Commentaires SHALL afficher un bouton de suppression à côté de ce Commentaire.
8. WHEN un Utilisateur_Authentifié clique sur le bouton de suppression d'un Commentaire, THE Interface_Commentaires SHALL supprimer le Commentaire et mettre à jour le Compteur_Commentaires affiché.

### Exigence 5 : Internationalisation des commentaires

**User Story :** En tant qu'utilisateur, je souhaite que l'interface des commentaires soit disponible en anglais et en français, afin de pouvoir utiliser l'application dans ma langue préférée.

#### Critères d'acceptation

1. THE Interface_Commentaires SHALL afficher tous les libellés, boutons et messages d'erreur dans la langue active sélectionnée par l'utilisateur (anglais ou français).
2. THE Interface_Commentaires SHALL utiliser le système de traduction existant (`LanguageContext` et `translations.ts`) pour tous les textes statiques de l'interface des commentaires.

### Exigence 6 : Intégration API et infrastructure

**User Story :** En tant que développeur, je souhaite que les endpoints de commentaires suivent les conventions existantes de l'API, afin de maintenir la cohérence de l'architecture.

#### Critères d'acceptation

1. THE API_Commentaires SHALL exposer un endpoint `POST /posts/{postId}/comments` pour la création de commentaires.
2. THE API_Commentaires SHALL exposer un endpoint `GET /posts/{postId}/comments` pour la récupération des commentaires d'une publication.
3. THE API_Commentaires SHALL exposer un endpoint `DELETE /posts/{postId}/comments/{commentId}` pour la suppression d'un commentaire.
4. THE API_Commentaires SHALL protéger tous les endpoints avec le middleware `withAuth` existant.
5. THE API_Commentaires SHALL retourner les réponses au format JSON avec les en-têtes CORS standards (`Access-Control-Allow-Origin: *`).
6. THE Système_Commentaires SHALL utiliser la table Comments existante dans DynamoDB (clé de partition : `id`, GSI `postId-index` avec clé de tri `createdAt`).
