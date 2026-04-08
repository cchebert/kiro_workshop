# Product Overview

Micro Blogging App — a social media platform for short-form content sharing, similar to Twitter/X.

## Core Features
- User registration and authentication (Cognito-backed)
- Create, view, and like posts (280 character limit)
- User profiles with display name, bio, and avatar
- Follow/unfollow other users
- Feed with sorting (newest, popular) and pagination
- Internationalization: English and French (i18n via custom translation system)

## Key Domain Concepts
- Posts: short-form content tied to a user, with likes and comments counts
- Users: identified by username, email, display name; have follower/following counts
- Follows: directional relationship (follower → followee)
- Likes: user-to-post relationship
