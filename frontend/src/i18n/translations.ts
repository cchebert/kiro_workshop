export type Language = 'en' | 'fr';

export const translations = {
  // Navigation & Layout
  'nav.feed': { en: 'Feed', fr: 'Fil' },
  'nav.newPost': { en: 'New Post', fr: 'Nouveau post' },
  'nav.profile': { en: 'Profile', fr: 'Profil' },
  'nav.welcome': { en: 'Welcome,', fr: 'Bienvenue,' },
  'nav.followers': { en: 'followers', fr: 'abonnés' },
  'nav.logout': { en: 'Logout', fr: 'Déconnexion' },

  // Login
  'login.title': { en: 'Login', fr: 'Connexion' },
  'login.username': { en: 'Username', fr: "Nom d'utilisateur" },
  'login.password': { en: 'Password', fr: 'Mot de passe' },
  'login.submit': { en: 'Login', fr: 'Se connecter' },
  'login.loggingIn': { en: 'Logging in...', fr: 'Connexion en cours...' },
  'login.noAccount': { en: "Don't have an account?", fr: "Vous n'avez pas de compte?" },
  'login.register': { en: 'Register', fr: "S'inscrire" },
  'login.fillAll': { en: 'Please fill in all fields', fr: 'Veuillez remplir tous les champs' },

  // Register
  'register.title': { en: 'Create an Account', fr: 'Créer un compte' },
  'register.username': { en: 'Username', fr: "Nom d'utilisateur" },
  'register.email': { en: 'Email', fr: 'Courriel' },
  'register.displayName': { en: 'Display Name', fr: "Nom d'affichage" },
  'register.password': { en: 'Password', fr: 'Mot de passe' },
  'register.confirmPassword': { en: 'Confirm Password', fr: 'Confirmer le mot de passe' },
  'register.submit': { en: 'Create Account', fr: 'Créer le compte' },
  'register.creating': { en: 'Creating account...', fr: 'Création du compte...' },
  'register.hasAccount': { en: 'Already have an account?', fr: 'Vous avez déjà un compte?' },
  'register.login': { en: 'Login', fr: 'Se connecter' },
  'register.fillAll': { en: 'Please fill in all fields', fr: 'Veuillez remplir tous les champs' },
  'register.passwordNoMatch': { en: 'Passwords do not match', fr: 'Les mots de passe ne correspondent pas' },
  'register.passwordTooShort': { en: 'Password must be at least 8 characters long', fr: 'Le mot de passe doit contenir au moins 8 caractères' },
  'register.pwdRequirements': { en: 'Password requirements', fr: 'Exigences du mot de passe' },
  'register.pwdMinLength': { en: 'At least 8 characters', fr: 'Au moins 8 caractères' },
  'register.pwdUppercase': { en: 'One uppercase letter', fr: 'Une lettre majuscule' },
  'register.pwdLowercase': { en: 'One lowercase letter', fr: 'Une lettre minuscule' },
  'register.pwdDigit': { en: 'One digit', fr: 'Un chiffre' },
  'register.pwdSpecial': { en: 'One special character', fr: 'Un caractère spécial' },

  // Feed
  'feed.recent': { en: 'Recent', fr: 'Récent' },
  'feed.sortBy': { en: 'Sort by:', fr: 'Trier par :' },
  'feed.newest': { en: 'Newest', fr: 'Plus récent' },
  'feed.popular': { en: 'Popular', fr: 'Populaire' },
  'feed.noPosts': { en: 'No posts yet. Be the first to post!', fr: 'Aucun post pour le moment. Soyez le premier!' },
  'feed.unknownUser': { en: 'Unknown User', fr: 'Utilisateur inconnu' },
  'feed.like': { en: 'Like', fr: "J'aime" },
  'feed.likes': { en: 'Likes', fr: "J'aime" },
  'feed.comment': { en: 'Comment', fr: 'Commentaire' },
  'feed.comments': { en: 'Comments', fr: 'Commentaires' },
  'feed.error': { en: 'Failed to load posts. Please try again later.', fr: 'Impossible de charger les posts. Veuillez réessayer plus tard.' },

  // Create Post
  'createPost.title': { en: 'Create a New Post', fr: 'Créer un nouveau post' },
  'createPost.label': { en: "What's on your mind?", fr: "Qu'avez-vous en tête?" },
  'createPost.submit': { en: 'Post', fr: 'Publier' },
  'createPost.posting': { en: 'Posting...', fr: 'Publication...' },
  'createPost.cancel': { en: 'Cancel', fr: 'Annuler' },
  'createPost.placeholder': { en: 'Write your idea here...', fr: 'Inscrire votre idée ici...' },
  'createPost.empty': { en: 'Post content cannot be empty', fr: 'Le contenu du post ne peut pas être vide' },
  'createPost.tooLong': { en: 'Post content cannot exceed', fr: 'Le contenu du post ne peut pas dépasser' },
  'createPost.characters': { en: 'characters', fr: 'caractères' },
  'createPost.notLoggedIn': { en: 'You must be logged in to create a post', fr: 'Vous devez être connecté pour créer un post' },

  // Profile
  'profile.posts': { en: 'Posts', fr: 'Posts' },
  'profile.noPosts': { en: 'No posts yet.', fr: 'Aucun post pour le moment.' },
  'profile.editProfile': { en: 'Edit Profile', fr: 'Modifier le profil' },
  'profile.follow': { en: 'Follow', fr: 'Suivre' },
  'profile.unfollow': { en: 'Unfollow', fr: 'Ne plus suivre' },
  'profile.following': { en: 'following', fr: 'abonnements' },
  'profile.followers': { en: 'followers', fr: 'abonnés' },
  'profile.displayName': { en: 'Display Name', fr: "Nom d'affichage" },
  'profile.bio': { en: 'Bio', fr: 'Bio' },
  'profile.save': { en: 'Save', fr: 'Enregistrer' },
  'profile.cancel': { en: 'Cancel', fr: 'Annuler' },
  'profile.likes': { en: 'likes', fr: "j'aime" },
  'profile.comments': { en: 'comments', fr: 'commentaires' },
  'profile.loadingProfile': { en: 'Loading profile...', fr: 'Chargement du profil...' },
  'profile.userNotFound': { en: 'User not found', fr: 'Utilisateur introuvable' },
  'profile.loadError': { en: 'Failed to load profile. Please try again later.', fr: 'Impossible de charger le profil. Veuillez réessayer plus tard.' },
  'profile.updateError': { en: 'Failed to update profile. Please try again.', fr: 'Impossible de mettre à jour le profil. Veuillez réessayer.' },
  'profile.followError': { en: 'Please try again.', fr: 'Veuillez réessayer.' },

  // Relative time
  'time.justNow': { en: 'just now', fr: "à l'instant" },
  'time.mAgo': { en: 'm ago', fr: 'min' },
  'time.hAgo': { en: 'h ago', fr: 'h' },
  'time.dAgo': { en: 'd ago', fr: 'j' },
  'time.moAgo': { en: 'mo ago', fr: 'mois' },
  'time.yAgo': { en: 'y ago', fr: 'an(s)' },

  // General
  'general.loading': { en: 'Loading...', fr: 'Chargement...' },
  'general.errorFallback': { en: 'Sorry, something went wrong.', fr: 'Désolé, une erreur est survenue.' },

  // Sidebar
  'sidebar.futureTitle': { en: 'Future content area', fr: 'Zone de contenu à venir' },
  'sidebar.futureDesc': { en: 'This space is reserved for upcoming features like trending topics, suggested users, or advertisements.', fr: 'Cet espace est réservé aux fonctionnalités à venir comme les sujets tendance, les utilisateurs suggérés ou les publicités.' },

  // Confirm dialogs
  'confirm.discardDraft': { en: 'Discard draft?', fr: 'Abandonner le brouillon ?' },
} as const;

export type TranslationKey = keyof typeof translations;
