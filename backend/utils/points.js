const User = require('../models/User');

// Point values for different actions
const POINT_VALUES = {
    project_created: 50,    // Creating a new project (major achievement)
    post_created: 20,       // Creating a post in a project (significant contribution)
    received_upvote: 5,     // Getting an upvote (community recognition)
    comment_made: 3         // Making a comment (engagement)
};

/**
 * Award points to a user for a specific action
 * @param {string} userId - The ID of the user to award points to
 * @param {string} action - The action type (project_created, post_created, etc.)
 * @param {string} referenceId - The ID of the related item (project, post, or comment)
 * @param {string} referenceModel - The model name of the reference (Project, Post, Comment)
 */
async function awardPoints(userId, action, referenceId, referenceModel) {
    if (!POINT_VALUES[action]) {
        throw new Error(`Invalid action type: ${action}`);
    }

    const points = POINT_VALUES[action];

    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Add points to total
        user.hatchPoints = (user.hatchPoints || 0) + points;

        // Record in history
        user.pointsHistory.push({
            action,
            points,
            reference: referenceId,
            referenceModel
        });

        await user.save();
        return { points, total: user.hatchPoints };
    } catch (error) {
        console.error('Error awarding points:', error);
        throw error;
    }
}

/**
 * Get a user's point history with pagination
 * @param {string} userId - The ID of the user
 * @param {number} page - Page number (1-based)
 * @param {number} limit - Number of items per page
 */
async function getPointHistory(userId, page = 1, limit = 10) {
    try {
        const user = await User.findById(userId).select('pointsHistory');
        if (!user) {
            throw new Error('User not found');
        }

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;

        const paginatedHistory = user.pointsHistory
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(startIndex, endIndex);

        return {
            history: paginatedHistory,
            total: user.pointsHistory.length,
            page,
            totalPages: Math.ceil(user.pointsHistory.length / limit)
        };
    } catch (error) {
        console.error('Error getting point history:', error);
        throw error;
    }
}

/**
 * Get user's current point total
 * @param {string} userId - The ID of the user
 */
async function getPoints(userId) {
    try {
        const user = await User.findById(userId).select('hatchPoints');
        if (!user) {
            throw new Error('User not found');
        }
        return user.hatchPoints || 0;
    } catch (error) {
        console.error('Error getting points:', error);
        throw error;
    }
}

module.exports = {
    POINT_VALUES,
    awardPoints,
    getPointHistory,
    getPoints
};