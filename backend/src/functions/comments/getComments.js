const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  QueryCommand,
  BatchGetCommand,
} = require('@aws-sdk/lib-dynamodb');
const { withAuth } = require('../../common/middleware');

// Initialize clients
const ddbClient = new DynamoDBClient();
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

/**
 * Lambda handler for getting comments on a post
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

    const commentsTableName = process.env.COMMENTS_TABLE;
    const usersTableName = process.env.USERS_TABLE;

    if (!commentsTableName || !usersTableName) {
      throw new Error('Required environment variables are not set');
    }

    // Parse query parameters
    const queryParams = event.queryStringParameters || {};
    const limit = parseInt(queryParams.limit) || 20;

    // Safely parse the nextToken
    let nextToken = null;
    try {
      if (queryParams.nextToken) {
        const decodedToken = decodeURIComponent(queryParams.nextToken);
        if (decodedToken) {
          nextToken = JSON.parse(decodedToken);
        }
      }
    } catch (error) {
      console.error('Error parsing nextToken:', error);
      nextToken = null;
    }

    // Query comments by postId using GSI, sorted chronologically (ascending)
    const queryCommandParams = {
      TableName: commentsTableName,
      IndexName: 'postId-index',
      KeyConditionExpression: 'postId = :postId',
      ExpressionAttributeValues: {
        ':postId': postId,
      },
      ScanIndexForward: true,
      Limit: limit,
    };

    if (nextToken && typeof nextToken === 'object' && Object.keys(nextToken).length > 0) {
      queryCommandParams.ExclusiveStartKey = nextToken;
    }

    const queryCommand = new QueryCommand(queryCommandParams);
    const result = await ddbDocClient.send(queryCommand);
    const comments = result.Items || [];

    // Encode the next token
    let encodedNextToken = null;
    if (result.LastEvaluatedKey && Object.keys(result.LastEvaluatedKey).length > 0) {
      try {
        encodedNextToken = encodeURIComponent(JSON.stringify(result.LastEvaluatedKey));
      } catch (error) {
        console.error('Error encoding lastEvaluatedKey:', error);
        encodedNextToken = null;
      }
    }

    // Enrich comments with author displayName from Users table
    const uniqueUserIds = [...new Set(comments.map((c) => c.userId))];

    const userMap = {};
    if (uniqueUserIds.length > 0) {
      // BatchGet users in chunks of 100 (DynamoDB limit)
      for (let i = 0; i < uniqueUserIds.length; i += 100) {
        const chunk = uniqueUserIds.slice(i, i + 100);
        const batchGetCommand = new BatchGetCommand({
          RequestItems: {
            [usersTableName]: {
              Keys: chunk.map((id) => ({ id })),
              ProjectionExpression: 'id, displayName',
            },
          },
        });

        const batchResult = await ddbDocClient.send(batchGetCommand);
        const users = batchResult.Responses?.[usersTableName] || [];
        users.forEach((user) => {
          userMap[user.id] = user;
        });
      }
    }

    const enrichedComments = comments.map((comment) => ({
      ...comment,
      user: userMap[comment.userId]
        ? { id: userMap[comment.userId].id, displayName: userMap[comment.userId].displayName }
        : undefined,
    }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        comments: enrichedComments,
        nextToken: encodedNextToken,
      }),
    };
  } catch (error) {
    console.error('Error getting comments:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        message: 'Error getting comments',
        error: error.message || 'Unknown error',
      }),
    };
  }
};

// Export the handler wrapped with authentication middleware
exports.handler = withAuth(handler);
