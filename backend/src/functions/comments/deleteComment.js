const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  GetCommand,
  DeleteCommand,
  UpdateCommand,
} = require('@aws-sdk/lib-dynamodb');
const { withAuth } = require('../../common/middleware');

// Initialize clients
const ddbClient = new DynamoDBClient();
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

/**
 * Lambda handler for deleting a comment on a post
 * @param {Object} event - API Gateway event with user info added by auth middleware
 * @returns {Object} - API Gateway response
 */
const handler = async (event) => {
  try {
    const postId = event.pathParameters?.postId;
    const commentId = event.pathParameters?.commentId;

    if (!postId || !commentId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ message: 'Missing post ID or comment ID' }),
      };
    }

    const commentsTableName = process.env.COMMENTS_TABLE;
    const postsTableName = process.env.POSTS_TABLE;

    if (!commentsTableName || !postsTableName) {
      throw new Error('Required environment variables are not set');
    }

    // Verify the comment exists
    const getCommentCommand = new GetCommand({
      TableName: commentsTableName,
      Key: { id: commentId },
    });

    const commentResult = await ddbDocClient.send(getCommentCommand);

    if (!commentResult.Item) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ message: 'Comment not found' }),
      };
    }

    // Check that the authenticated user is the comment author
    if (commentResult.Item.userId !== event.user.id) {
      return {
        statusCode: 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ message: 'You are not authorized to delete this comment' }),
      };
    }

    // Delete the comment
    const deleteCommand = new DeleteCommand({
      TableName: commentsTableName,
      Key: { id: commentId },
    });

    await ddbDocClient.send(deleteCommand);

    // Decrement commentsCount on the post atomically (minimum 0)
    const updateCommand = new UpdateCommand({
      TableName: postsTableName,
      Key: { id: postId },
      UpdateExpression: 'SET commentsCount = if_not_exists(commentsCount, :zero) - :one',
      ConditionExpression: 'if_not_exists(commentsCount, :zero) > :zero',
      ExpressionAttributeValues: {
        ':zero': 0,
        ':one': 1,
      },
    });

    try {
      await ddbDocClient.send(updateCommand);
    } catch (updateError) {
      // ConditionalCheckFailedException means commentsCount is already 0 — safe to ignore
      if (updateError.name !== 'ConditionalCheckFailedException') {
        throw updateError;
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ message: 'Comment deleted successfully' }),
    };
  } catch (error) {
    console.error('Error deleting comment:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        message: 'Error deleting comment',
        error: error.message || 'Unknown error',
      }),
    };
  }
};

// Export the handler wrapped with authentication middleware
exports.handler = withAuth(handler);
