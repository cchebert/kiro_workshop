const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');
const { withAuth } = require('../../common/middleware');

// Initialize clients
const ddbClient = new DynamoDBClient();
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

/**
 * Lambda handler for creating a comment on a post
 * @param {Object} event - API Gateway event with user info added by auth middleware
 * @returns {Object} - API Gateway response
 */
const handler = async (event) => {
  try {
    const postId = event.pathParameters?.postId;

    if (!postId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ message: 'Missing post ID' }),
      };
    }

    if (!event.body) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ message: 'Missing request body' }),
      };
    }

    const { content } = JSON.parse(event.body);

    if (!content || content.trim() === '') {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ message: 'Comment content cannot be empty' }),
      };
    }

    const MAX_CONTENT_LENGTH = 280;
    if (content.length > MAX_CONTENT_LENGTH) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ message: `Comment content cannot exceed ${MAX_CONTENT_LENGTH} characters` }),
      };
    }

    const commentsTableName = process.env.COMMENTS_TABLE;
    const postsTableName = process.env.POSTS_TABLE;

    if (!commentsTableName || !postsTableName) {
      throw new Error('Required environment variables are not set');
    }

    // Verify the post exists
    const getPostCommand = new GetCommand({
      TableName: postsTableName,
      Key: { id: postId },
    });

    const postResult = await ddbDocClient.send(getPostCommand);

    if (!postResult.Item) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ message: 'Post not found' }),
      };
    }

    // Create comment record
    const commentId = uuidv4();
    const timestamp = new Date().toISOString();

    const comment = {
      id: commentId,
      postId,
      userId: event.user.id,
      content,
      createdAt: timestamp,
    };

    const putCommand = new PutCommand({
      TableName: commentsTableName,
      Item: comment,
    });

    await ddbDocClient.send(putCommand);

    // Increment commentsCount on the post atomically
    const updateCommand = new UpdateCommand({
      TableName: postsTableName,
      Key: { id: postId },
      UpdateExpression: 'SET commentsCount = if_not_exists(commentsCount, :zero) + :one',
      ExpressionAttributeValues: {
        ':zero': 0,
        ':one': 1,
      },
    });

    await ddbDocClient.send(updateCommand);

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        message: 'Comment created successfully',
        comment,
      }),
    };
  } catch (error) {
    console.error('Error creating comment:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        message: 'Error creating comment',
        error: error.message || 'Unknown error',
      }),
    };
  }
};

// Export the handler wrapped with authentication middleware
exports.handler = withAuth(handler);
