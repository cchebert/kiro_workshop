# Implementation Plan: Post Comments

## Overview

Implement a comment system for the micro-blogging app. The plan follows a backend-first approach: infrastructure and Lambda functions first, then frontend API layer, UI components, and i18n. Each backend function mirrors the existing patterns (e.g., `likePost.js`, `createPost.js`). The frontend adds a `CommentSection` component integrated into the Feed, with full i18n support.

## Tasks

- [ ] 1. Infrastructure — Add comment Lambda functions and API Gateway routes
  - [x] 1.1 Create `createComment.js` Lambda handler
    - Create `backend/src/functions/comments/createComment.js`
    - Follow the same pattern as `createPost.js` and `likePost.js`: parse body, validate content (non-empty, ≤280 chars), verify post exists via `GetCommand`, create comment record with `PutCommand` (id, postId, userId, content, createdAt), increment `commentsCount` on the post via atomic `UpdateCommand`
    - Wrap with `withAuth` middleware
    - Return 201 with the created comment, or 400/404/500 with descriptive error messages
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [x] 1.2 Create `getComments.js` Lambda handler
    - Create `backend/src/functions/comments/getComments.js`
    - Query GSI `postId-index` with `ScanIndexForward: true` for chronological order
    - Support pagination: `limit` query param (default 20), `nextToken` encoded/decoded like `getPosts.js`
    - Enrich each comment with author `displayName` from Users table
    - Return 200 with `{ comments, nextToken }`
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 1.3 Create `deleteComment.js` Lambda handler
    - Create `backend/src/functions/comments/deleteComment.js`
    - Verify comment exists via `GetCommand`, check `userId` matches authenticated user (403 if not), delete via `DeleteCommand`, decrement `commentsCount` atomically (minimum 0)
    - Return 200 on success, 403/404/500 with descriptive error messages
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 1.4 Register Lambda functions and API routes in CDK stack
    - In `infrastructure/lib/app-stack.ts`, add three `NodejsFunction` constructs (`CreateCommentFunction`, `GetCommentsFunction`, `DeleteCommentFunction`) with environment variables `COMMENTS_TABLE`, `POSTS_TABLE`, `USERS_TABLE`
    - Grant DynamoDB permissions: read/write on Comments and Posts, read on Users
    - Add API Gateway routes under the existing `{postId}` resource: `comments` resource with GET and POST methods, `comments/{commentId}` resource with DELETE method
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 2. Checkpoint — Verify backend compiles and infrastructure is valid
  - Ensure all backend files have no syntax errors and the CDK stack compiles. Ask the user if questions arise.

- [ ] 3. Frontend — API layer, types, and i18n
  - [ ] 3.1 Create `Comment` type
    - Create `frontend/src/types/comment.ts` with the `Comment` interface as defined in the design (id, postId, userId, content, createdAt, user?: { id, displayName })
    - _Requirements: 2.4_

  - [ ] 3.2 Add `commentsApi` to the API service layer
    - In `frontend/src/services/api.ts`, add a `commentsApi` object with `getComments`, `createComment`, and `deleteComment` methods following the existing `postsApi` pattern
    - Import the `Comment` type
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ] 3.3 Add comment translation keys
    - In `frontend/src/i18n/translations.ts`, add all comment-related translation keys (placeholder, submit, submitting, delete, deleteConfirm, loadMore, empty, error, createError, deleteError, tooLong, emptyContent) with EN and FR values as specified in the design
    - _Requirements: 5.1, 5.2_

- [ ] 4. Frontend — CommentSection component and Feed integration
  - [ ] 4.1 Create `CommentSection.tsx` component
    - Create `frontend/src/components/CommentSection.tsx`
    - Accept props: `postId`, `commentsCount`, `onCommentsCountChange`
    - On mount, fetch comments via `commentsApi.getComments`
    - Render comment list: each comment shows author displayName as link to `/profile/{userId}`, content, formatted date
    - Render input field + submit button for new comments
    - Handle create: call `commentsApi.createComment`, append to list, call `onCommentsCountChange(+1)`
    - Handle delete: show delete button only for current user's comments, call `commentsApi.deleteComment`, remove from list, call `onCommentsCountChange(-1)`
    - Handle pagination: show "Load more" button when `nextToken` exists
    - Use `useLanguage()` for all labels, use `useAuth()` for token and current user
    - Display error messages using translated keys on failure
    - Disable submit button during loading to prevent double submissions
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 5.1, 5.2_

  - [ ] 4.2 Integrate `CommentSection` into `Feed.tsx`
    - Add `expandedComments: Set<string>` state to track which posts have comments open
    - Make the comments count in each post card clickable to toggle the comment section
    - Render `<CommentSection>` below the post card when expanded
    - Update local post state when `onCommentsCountChange` fires
    - _Requirements: 4.1, 4.3, 4.4, 4.8_

- [ ] 5. Checkpoint — Verify frontend compiles and UI renders correctly
  - Ensure all frontend files have no type errors or lint issues. Ask the user if questions arise.

- [ ]* 6. Property-based tests for backend handlers
  - [ ]* 6.1 Write property test: Comment data completeness (Property 1)
    - **Property 1: Complétude des données d'un commentaire**
    - For any valid content (non-empty, ≤280 chars) and existing post, the created comment must contain all required fields (id, postId, userId, content, createdAt) and the fetched comment must include author displayName
    - Use `fast-check` with mocked DynamoDB
    - **Validates: Requirements 1.1, 2.4**

  - [ ]* 6.2 Write property test: Invalid content rejection (Property 2)
    - **Property 2: Rejet des contenus invalides**
    - For any string that is empty, whitespace-only, or exceeds 280 characters, createComment must return 400 and the comment list must remain unchanged
    - **Validates: Requirements 1.3, 1.4**

  - [ ]* 6.3 Write property test: Chronological ordering (Property 3)
    - **Property 3: Tri chronologique des commentaires**
    - For any set of comments on a post, getComments must return them sorted by createdAt ascending
    - **Validates: Requirement 2.1**

  - [ ]* 6.4 Write property test: Pagination correctness (Property 4)
    - **Property 4: Correction de la pagination**
    - For any post with N > 20 comments, the first page has ≤20 items with a non-null nextToken, and the union of all pages equals exactly N comments with no duplicates or omissions
    - **Validates: Requirement 2.2**

  - [ ]* 6.5 Write property test: Comments count consistency (Property 5)
    - **Property 5: Cohérence du compteur de commentaires**
    - After C creations and S deletions, commentsCount must equal max(C - S, 0)
    - **Validates: Requirements 1.2, 3.2**

  - [ ]* 6.6 Write property test: Author-based delete authorization (Property 6)
    - **Property 6: Autorisation de suppression basée sur l'auteur**
    - Delete succeeds iff the authenticated user is the comment author; non-authors receive 403
    - **Validates: Requirements 3.1, 3.3**

  - [ ]* 6.7 Write property test: Comment render completeness (Property 7)
    - **Property 7: Complétude du rendu d'un commentaire**
    - For any rendered comment, the output must contain the author displayName as a link to `/profile/{userId}`, the content text, and a formatted creation date
    - **Validates: Requirement 4.5**

  - [ ]* 6.8 Write property test: Delete button visibility (Property 8)
    - **Property 8: Visibilité du bouton de suppression selon l'auteur**
    - The delete button is visible iff the current user is the comment author
    - **Validates: Requirement 4.7**

- [ ] 7. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Backend handlers follow existing conventions (CommonJS, AWS SDK v3, `withAuth` middleware, CORS headers)
- Frontend follows existing patterns (fetch-based API, React Context, custom i18n)
- Property tests use `fast-check` and validate universal correctness properties from the design
