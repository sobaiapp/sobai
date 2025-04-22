import { Client, Account, Databases, Storage, ID, Query, Permission, Role } from 'react-native-appwrite';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initialize Appwrite client with hardcoded values (can replace with .env later)
const client = new Client();

// Set the endpoint and project ID
client
  .setEndpoint('https://cloud.appwrite.io/v1')  // Replace with your Appwrite endpoint
  .setProject('679926010035434b938c')          // Replace with your project ID
  .setPlatform('com.sobai.app');

// Initialize services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { Query, ID, Permission, Role }; // Export these objects directly

// Database and collection IDs
export const DATABASE_ID = '67ead41e00391c4d579f';            // Replace with your database ID
export const PROFILES_COLLECTION_ID = '67eb25180014d70eed51'; // Replace with your collection ID
export const FRIEND_REQUESTS_COLLECTION_ID = 'friend_requests'; // Replace with your friend requests collection ID
export const MESSAGES_COLLECTION_ID = 'messages';
export const STATS_COLLECTION_ID = 'stats';
export const ACHIEVEMENTS_COLLECTION_ID = 'achievements';
export const POSTS_COLLECTION_ID = 'posts';

// Storage bucket ID for profile pictures
export const AVATAR_BUCKET_ID = 'profile_pictures'; // Replace with your actual bucket ID

/**
 * Auth Functions
 */

/**
 * Gets a user's friends list
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of friend profiles
 */
export const getUserFriends = async (userId) => {
  try {
    console.log('Getting friends for user:', userId);
    
    // Get the user's profile
    const profile = await getUserProfile(userId);
    if (!profile) {
      console.log('User profile not found');
      return [];
    }
    
    console.log('User profile retrieved:', {
      id: profile.$id,
      name: profile.name,
      friends: profile.friends || []
    });
    
    // Check if user has any friends
    if (!profile.friends || profile.friends.length === 0) {
      console.log('No friends found in profile');
      return [];
    }

    console.log('Friend IDs to fetch:', profile.friends);
    
    // Get all friend profiles in parallel
    const friendProfiles = await Promise.all(
      profile.friends.map(async (friendId) => {
        try {
          const friendProfile = await getUserProfile(friendId);
          if (!friendProfile) {
            console.log('Friend profile not found:', friendId);
            return null;
          }
          console.log('Retrieved friend profile:', {
            id: friendProfile.$id,
            name: friendProfile.name
          });
          return friendProfile;
        } catch (error) {
          console.error('Error fetching friend profile:', friendId, error);
          return null;
        }
      })
    );

    // Filter out null profiles and the current user
    const filteredFriends = friendProfiles.filter(profile => 
      profile !== null && 
      profile.$id !== userId
    );
    
    console.log('Final filtered friends list:', filteredFriends.map(f => ({
      id: f.$id,
      name: f.name
    })));
    
    return filteredFriends;
  } catch (error) {
    console.error('Error getting user friends:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      type: error.type,
      response: error.response
    });
    return [];
  }
};

/**
 * Creates a new user account and profile
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {string} name - User's full name
 * @returns {Promise<object>} - The created user object
 */
export const createUser = async (email, password, name) => {
  try {
    // Create user account
    const user = await account.create(ID.unique(), email, password, name);
    
    // Create the user's profile immediately after account creation
    await createUserProfile(user.$id, { name, email });
    
    // Automatically login the user after registration
    await account.createEmailPasswordSession(email, password);

    return user;
  } catch (error) {
    console.error('Registration error details:', {
      message: error.message,
      code: error.code,
      type: error.type,
      response: error.response
    });
    throw formatAppwriteError(error);
  }
};

/**
 * Logs in a user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<object>} - The logged in user object
 */
export const loginUser = async (email, password) => {
  try {
    // Clear all cached data before login
    try {
      await AsyncStorage.multiRemove([
        'user',
        'profile',
        'session',
        'friends',
        'milestones',
        'messages',
        'stats',
        'achievements',
        'posts'
      ]);
    } catch (error) {
      console.log('Error clearing cached data before login:', error);
    }

    // First, try to delete any existing sessions
    try {
      const sessions = await account.listSessions();
      for (const session of sessions.sessions) {
        try {
          await account.deleteSession(session.$id);
        } catch (error) {
          console.log(`Failed to delete session ${session.$id}`);
        }
      }
    } catch (error) {
      console.log('No active sessions found');
    }

    // Now create a new session
    await account.createEmailPasswordSession(email, password);
    return await getCurrentUser();
  } catch (error) {
    throw formatAppwriteError(error);
  }
};

/**
 * Gets the currently logged in user
 * @returns {Promise<object|null>} - Current user object or null if not logged in
 */
export const getCurrentUser = async () => {
  try {
    return await account.get();
  } catch (error) {
    return null;
  }
};

/**
 * Logs out the current user
 * @returns {Promise<void>}
 */
export const logoutUser = async () => {
  try {
    // First try to delete current session
    try {
      await account.deleteSession('current');
    } catch (error) {
      console.log('No current session to delete');
    }
    
    // Then try to delete all sessions
    try {
      const sessions = await account.listSessions();
      for (const session of sessions.sessions) {
        try {
          await account.deleteSession(session.$id);
        } catch (error) {
          console.log(`Failed to delete session ${session.$id}`);
        }
      }
    } catch (error) {
      console.log('No sessions to delete');
    }

    // Clear all cached data from AsyncStorage
    try {
      await AsyncStorage.multiRemove([
        'user',
        'profile',
        'session',
        'friends',
        'milestones',
        'messages',
        'stats',
        'achievements',
        'posts'
      ]);
    } catch (error) {
      console.log('Error clearing AsyncStorage:', error);
    }
  } catch (error) {
    console.error('Logout error:', error);
    throw formatAppwriteError(error);
  }
};

/**
 * Verifies if there's an active session
 * @returns {Promise<boolean>} - True if valid session exists
 */
export const verifySession = async () => {
  try {
    const session = await account.getSession('current');
    return !!session;
  } catch (error) {
    return false;
  }
};

/**
 * Profile Functions
 */

/**
 * Creates a user profile document
 * @param {string} userId - User ID
 * @param {object} data - Profile data
 * @returns {Promise<object>} - Created profile document
 */
export const createUserProfile = async (userId, data) => {
  try {
    // First check if the profile already exists
    try {
      const existingProfile = await databases.getDocument(
        DATABASE_ID,
        PROFILES_COLLECTION_ID,
        userId
      );
      if (existingProfile) {
        return existingProfile;
      }
    } catch (error) {
      // If document not found, continue with creation
      if (!error.message.includes('Document with the requested ID could not be found')) {
        throw error;
      }
    }

    // Create the profile with simpler permissions
    return await databases.createDocument(
      DATABASE_ID,
      PROFILES_COLLECTION_ID,
      userId,
      {
        userId,
        name: data.name,
        email: data.email,
        streak: 0,
        avatar: generateAvatarUrl(data.name),
        milestones: [],
        friends: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    );
  } catch (error) {
    console.error('Profile creation error:', error);
    console.log('Error details:', {
      message: error.message,
      code: error.code,
      type: error.type,
      response: error.response
    });
    throw formatAppwriteError(error);
  }
};

/**
 * Gets a user's profile
 * @param {string} userId - User ID
 * @returns {Promise<object>} - User profile
 */
export const getUserProfile = async (userId) => {
  try {
    console.log('Getting profile for user:', userId);
    
    // Try to get the profile by userId
    const response = await databases.listDocuments(
      DATABASE_ID,
      PROFILES_COLLECTION_ID,
      [Query.equal('userId', userId)]
    );

    if (response.documents.length > 0) {
      console.log('Found profile:', response.documents[0]);
      return response.documents[0];
    }

    console.log('Profile not found for user:', userId);
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      type: error.type,
      response: error.response
    });
    throw formatAppwriteError(error);
  }
};

/**
 * Updates a user's profile
 * @param {string} userId - User ID
 * @param {object} data - Profile data to update
 * @returns {Promise<object>} - Updated profile document
 */
export const updateUserProfile = async (userId, data) => {
  try {
    return await databases.updateDocument(
      DATABASE_ID,
      PROFILES_COLLECTION_ID,
      userId,
      {
        ...data,
        updatedAt: new Date().toISOString()
      }
    );
  } catch (error) {
    console.error('Profile update error:', error);
    throw formatAppwriteError(error);
  }
};

/**
 * Uploads a profile picture
 * @param {string} userId - User ID
 * @param {File} file - Image file to upload
 * @returns {Promise<string>} - URL of the uploaded image
 */
export const uploadProfilePicture = async (file) => {
  try {
    const response = await storage.createFile(
      AVATAR_BUCKET_ID,
      ID.unique(),
      file
    );
    return response.$id;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error;
  }
};

/**
 * Deletes a profile picture
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const deleteProfilePicture = async (userId) => {
  try {
    // Delete the file from storage
    await storage.deleteFile(AVATAR_BUCKET_ID, userId);

    // Update the user's profile with a default avatar
    const defaultAvatar = generateAvatarUrl(userId);
    await updateUserProfile(userId, { avatar: defaultAvatar });
  } catch (error) {
    console.error('Profile picture deletion error:', error);
    throw formatAppwriteError(error);
  }
};

/**
 * Gets a user's milestones
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of milestones
 */
export const getUserMilestones = async (userId) => {
  try {
    const profile = await getUserProfile(userId);
    return profile?.milestones || [];
  } catch (error) {
    console.error('Error getting user milestones:', error);
    return [];
  }
};

/**
 * Helper Functions
 */

/**
 * Formats Appwrite error messages for user display
 * @param {object} error - Appwrite error object
 * @returns {Error} - Formatted error
 */
const formatAppwriteError = (error) => {
  // Log the original error for debugging
  console.log('Original Appwrite error:', error);
  
  // If it's already an Error object with a message, use that
  if (error instanceof Error) {
    return error;
  }
  
  // Extract the actual error message from Appwrite
  let message = error.message || 'An unknown error occurred';
  
  // Common error codes mapping
  const errorMessages = {
    409: 'An account with this email already exists',
    401: 'Invalid email or password',
    400: 'Invalid request data',
    500: 'Server error, please try again later',
    404: 'Resource not found'
  };
  
  // Use the error code mapping if available
  if (error.code && errorMessages[error.code]) {
    message = errorMessages[error.code];
  }
  
  // For storage errors
  if (message.includes('storage')) {
    message = 'File upload failed. Please try again.';
  }
  
  return new Error(message);
};

/**
 * Generates avatar URL from name
 * @param {string} name - User's name
 * @returns {string} - Avatar URL
 */
const generateAvatarUrl = (name) => {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random&size=256`;
};

/**
 * Search for users by name or email
 * @param {string} searchQuery - The search term
 * @returns {Promise<Array>} - List of matching users
 */
export const searchUsers = async (searchQuery) => {
  try {
    console.log('Searching for users with query:', searchQuery);
    
    // Get all profiles
    const users = await databases.listDocuments(
      DATABASE_ID,
      PROFILES_COLLECTION_ID,
      [
        Query.limit(100)
      ]
    );
    
    console.log('Total users found:', users.documents.length);
    
    // Filter users based on name or email (case insensitive)
    const searchResults = users.documents.filter(user => {
      if (!user) return false;
      
      const searchLower = searchQuery.toLowerCase();
      const nameMatch = user.name?.toLowerCase().includes(searchLower);
      const emailMatch = user.email?.toLowerCase().includes(searchLower);
      
      console.log('Checking user:', {
        id: user.$id,
        name: user.name,
        email: user.email,
        nameMatch,
        emailMatch
      });
      
      return nameMatch || emailMatch;
    });
    
    console.log('Search results count:', searchResults.length);
    return searchResults;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

/**
 * Sends a friend request to another user
 * @param {string} fromUserId - ID of the user sending the request
 * @param {string} toUserId - ID of the user receiving the request
 * @returns {Promise<object>} - The created friend request
 */
export const sendFriendRequest = async (fromUserId, toUserId) => {
  try {
    // Create a friend request document
    const request = await databases.createDocument(
      DATABASE_ID,
      FRIEND_REQUESTS_COLLECTION_ID,
      ID.unique(),
      {
        fromUserId,
        toUserId,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    );
    
    return request;
  } catch (error) {
    console.error('Friend request error:', error);
    throw formatAppwriteError(error);
  }
};

/**
 * Accepts a friend request and updates both users' friends lists
 * @param {string} requestId - ID of the friend request
 * @param {string} fromUserId - ID of the user who sent the request
 * @param {string} toUserId - ID of the user accepting the request
 * @returns {Promise<object>} - The updated friend request
 */
export const acceptFriendRequest = async (requestId, fromUserId, toUserId) => {
  try {
    console.log('Starting friend request acceptance process:', { requestId, fromUserId, toUserId });
    
    // First, get the friend request to verify it exists and is pending
    const friendRequest = await databases.getDocument(
      DATABASE_ID,
      FRIEND_REQUESTS_COLLECTION_ID,
      requestId
    );
    
    if (!friendRequest || friendRequest.status !== 'pending') {
      throw new Error('Invalid friend request or request already processed');
    }
    
    // Get both users' profiles
    const [fromUserProfile, toUserProfile] = await Promise.all([
      getUserProfile(fromUserId),
      getUserProfile(toUserId)
    ]);
    
    if (!fromUserProfile || !toUserProfile) {
      throw new Error('Could not find one or both user profiles');
    }
    
    console.log('Current profiles before update:', { 
      fromUser: { 
        id: fromUserProfile.$id, 
        friends: fromUserProfile.friends || [],
        name: fromUserProfile.name 
      },
      toUser: { 
        id: toUserProfile.$id, 
        friends: toUserProfile.friends || [],
        name: toUserProfile.name 
      }
    });
    
    // Update the friend request status first
    await databases.updateDocument(
      DATABASE_ID,
      FRIEND_REQUESTS_COLLECTION_ID,
      requestId,
      {
        status: 'accepted',
        updatedAt: new Date().toISOString()
      }
    );
    
    // Prepare the updated friends lists
    const fromUserFriends = new Set([...(fromUserProfile.friends || []), toUserId]);
    const toUserFriends = new Set([...(toUserProfile.friends || []), fromUserId]);
    
    console.log('Preparing to update friends lists:', {
      fromUserFriends: Array.from(fromUserFriends),
      toUserFriends: Array.from(toUserFriends)
    });
    
    // Update both users' friends lists in sequence to avoid race conditions
    await databases.updateDocument(
      DATABASE_ID,
      PROFILES_COLLECTION_ID,
      fromUserProfile.$id,
      {
        friends: Array.from(fromUserFriends),
        updatedAt: new Date().toISOString()
      }
    );
    
    await databases.updateDocument(
      DATABASE_ID,
      PROFILES_COLLECTION_ID,
      toUserProfile.$id,
      {
        friends: Array.from(toUserFriends),
        updatedAt: new Date().toISOString()
      }
    );
    
    // Verify the updates by fetching the profiles again
    const [updatedFromUser, updatedToUser] = await Promise.all([
      getUserProfile(fromUserId),
      getUserProfile(toUserId)
    ]);
    
    console.log('Final profiles after update:', {
      fromUser: {
        id: updatedFromUser.$id,
        friends: updatedFromUser.friends,
        name: updatedFromUser.name
      },
      toUser: {
        id: updatedToUser.$id,
        friends: updatedToUser.friends,
        name: updatedToUser.name
      }
    });
    
    return friendRequest;
  } catch (error) {
    console.error('Accept friend request error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      type: error.type,
      response: error.response
    });
    throw formatAppwriteError(error);
  }
};

/**
 * Rejects a friend request
 * @param {string} requestId - ID of the friend request
 * @returns {Promise<void>}
 */
export const rejectFriendRequest = async (requestId) => {
  try {
    // Update the request status
    await databases.updateDocument(
      DATABASE_ID,
      FRIEND_REQUESTS_COLLECTION_ID,
      requestId,
      {
        status: 'rejected',
        updatedAt: new Date().toISOString()
      }
    );
  } catch (error) {
    console.error('Reject friend request error:', error);
    throw formatAppwriteError(error);
  }
};

/**
 * Gets friend requests for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of friend requests
 */
export const getFriendRequests = async (userId) => {
  try {
    console.log('Getting friend requests for user:', userId);
    
    // Get all pending friend requests for the user
    const requests = await databases.listDocuments(
      DATABASE_ID,
      FRIEND_REQUESTS_COLLECTION_ID,
      [
        Query.equal('toUserId', userId),
        Query.equal('status', 'pending')
      ]
    );
    
    console.log('Found friend requests:', requests.documents);
    
    if (requests.documents.length === 0) {
      console.log('No friend requests found');
      return [];
    }
    
    // Get profiles of users who sent the requests
    const fromUserIds = requests.documents.map(request => request.fromUserId);
    const fromUsersResponse = await databases.listDocuments(
      DATABASE_ID,
      PROFILES_COLLECTION_ID,
      [Query.equal('userId', fromUserIds)]
    );
    
    console.log('Found from users:', fromUsersResponse.documents);
    
    // Combine request data with user profiles
    const requestsWithProfiles = requests.documents.map(request => {
      const fromUser = fromUsersResponse.documents.find(
        doc => doc.userId === request.fromUserId
      );
      return {
        ...request,
        fromUser
      };
    });
    
    console.log('Final friend requests with profiles:', requestsWithProfiles);
    return requestsWithProfiles;
  } catch (error) {
    console.error('Error getting friend requests:', error);
    // If the collection doesn't exist, try to create it
    if (error.message.includes('Collection with the requested ID could not be found')) {
      console.log('Friend requests collection does not exist. Attempting to create it...');
      const created = await createFriendRequestsCollection();
      if (created) {
        // Try again after creating the collection
        return getFriendRequests(userId);
      }
    }
    return [];
  }
};

/**
 * Removes a friend from the user's friends list
 * @param {string} userId - User ID
 * @param {string} friendId - Friend's user ID
 * @returns {Promise<object>} - Updated user profile
 */
export const removeFriend = async (userId, friendId) => {
  try {
    // Get user profile
    const userProfile = await getUserProfile(userId);
    
    // Remove friend from friends list
    const updatedFriends = (userProfile.friends || []).filter(id => id !== friendId);
    
    // Update user profile
    await updateUserProfile(userId, { friends: updatedFriends });
    
    return await getUserProfile(userId);
  } catch (error) {
    console.error('Remove friend error:', error);
    throw formatAppwriteError(error);
  }
};

// Helper function to get profile picture URL
export const getProfilePictureUrl = (fileId) => {
  if (!fileId) return null;
  try {
    return storage.getFileView(AVATAR_BUCKET_ID, fileId).href;
  } catch (error) {
    console.error('Error getting profile picture URL:', error);
    return null;
  }
};

// Helper function to create profile pictures bucket if it doesn't exist
export const createProfilePicturesBucket = async () => {
  try {
    const buckets = await storage.listBuckets();
    const bucketExists = buckets.buckets.some(bucket => bucket.$id === AVATAR_BUCKET_ID);
    
    if (!bucketExists) {
      await storage.createBucket(
        AVATAR_BUCKET_ID,
        'Profile Pictures',
        'profile_pictures',
        true,
        true
      );
      console.log('Profile pictures bucket created successfully');
    } else {
      console.log('Profile pictures bucket already exists');
    }
  } catch (error) {
    console.error('Error creating profile pictures bucket:', error);
    throw error;
  }
};

/**
 * Add this function to create the friend_requests collection if it doesn't exist
 * @returns {Promise<boolean>} - True if collection was created or already exists
 */
export const createFriendRequestsCollection = async () => {
  try {
    // Check if the collection exists
    await databases.getCollection(DATABASE_ID, FRIEND_REQUESTS_COLLECTION_ID);
    console.log('Friend requests collection already exists');
    return true;
  } catch (error) {
    if (error.message.includes('Collection with the requested ID could not be found')) {
      console.log('Creating friend_requests collection...');
      try {
        // Create the collection with security rules
        await databases.createCollection(
          DATABASE_ID, 
          FRIEND_REQUESTS_COLLECTION_ID, 
          'Friend Requests',
          [
            Permission.create(Role.user()),
            Permission.read(Role.user()),
            Permission.update(Role.user()),
            Permission.delete(Role.user())
          ]
        );
        
        // Create the required attributes
        await databases.createStringAttribute(DATABASE_ID, FRIEND_REQUESTS_COLLECTION_ID, 'fromUserId', 255, true);
        await databases.createStringAttribute(DATABASE_ID, FRIEND_REQUESTS_COLLECTION_ID, 'toUserId', 255, true);
        await databases.createStringAttribute(DATABASE_ID, FRIEND_REQUESTS_COLLECTION_ID, 'status', 255, true);
        await databases.createDatetimeAttribute(DATABASE_ID, FRIEND_REQUESTS_COLLECTION_ID, 'createdAt', true);
        await databases.createDatetimeAttribute(DATABASE_ID, FRIEND_REQUESTS_COLLECTION_ID, 'updatedAt', true);
        
        // Create indexes
        await databases.createIndex(DATABASE_ID, FRIEND_REQUESTS_COLLECTION_ID, 'fromUserId_idx', 'key', ['fromUserId'], false);
        await databases.createIndex(DATABASE_ID, FRIEND_REQUESTS_COLLECTION_ID, 'toUserId_idx', 'key', ['toUserId'], false);
        await databases.createIndex(DATABASE_ID, FRIEND_REQUESTS_COLLECTION_ID, 'status_idx', 'key', ['status'], false);
        await databases.createIndex(DATABASE_ID, FRIEND_REQUESTS_COLLECTION_ID, 'fromTo_idx', 'key', ['fromUserId', 'toUserId'], false);
        
        console.log('Friend requests collection created successfully');
        return true;
      } catch (createError) {
        console.error('Error creating friend_requests collection:', createError);
        return false;
      }
    }
    console.error('Error checking friend_requests collection:', error);
    return false;
  }
};

export const debugFriendRequest = async (requestId, fromUserId, toUserId) => {
  try {
    console.log('Debugging friend request state:', { requestId, fromUserId, toUserId });
    
    // Get the friend request
    const request = await databases.getDocument(
      DATABASE_ID,
      FRIEND_REQUESTS_COLLECTION_ID,
      requestId
    );
    console.log('Friend request state:', request);
    
    // Get both users' profiles
    const [fromUser, toUser] = await Promise.all([
      getUserProfile(fromUserId),
      getUserProfile(toUserId)
    ]);
    
    console.log('From user profile:', {
      id: fromUser.$id,
      name: fromUser.name,
      friends: fromUser.friends
    });
    
    console.log('To user profile:', {
      id: toUser.$id,
      name: toUser.name,
      friends: toUser.friends
    });
    
    return {
      request,
      fromUser,
      toUser
    };
  } catch (error) {
    console.error('Debug error:', error);
    throw error;
  }
};

/**
 * Creates the messages collection if it doesn't exist
 * @returns {Promise<boolean>} - True if collection was created or already exists
 */
export const createMessagesCollection = async () => {
  try {
    // Instead of using getCollection, we'll try to list documents
    // If the collection doesn't exist, this will throw an error
    await databases.listDocuments(
      DATABASE_ID,
      MESSAGES_COLLECTION_ID,
      [Query.limit(1)]
    );
    console.log('Messages collection already exists');
    return true;
  } catch (error) {
    if (error.message && error.message.includes('Collection with the requested ID could not be found')) {
      console.log('Creating messages collection...');
      try {
        // Create the collection with security rules
        await databases.createCollection(
          DATABASE_ID, 
          MESSAGES_COLLECTION_ID, 
          'Messages',
          [
            Permission.create(Role.user()),
            Permission.read(Role.user()),
            Permission.update(Role.user()),
            Permission.delete(Role.user())
          ]
        );
        
        console.log('Collection created, now adding attributes...');
        
        // Create the required attributes
        await databases.createStringAttribute(DATABASE_ID, MESSAGES_COLLECTION_ID, 'fromUserId', 255, true);
        console.log('fromUserId attribute created');
        
        await databases.createStringAttribute(DATABASE_ID, MESSAGES_COLLECTION_ID, 'toUserId', 255, true);
        console.log('toUserId attribute created');
        
        await databases.createStringAttribute(DATABASE_ID, MESSAGES_COLLECTION_ID, 'text', 1000, true);
        console.log('text attribute created');
        
        await databases.createDatetimeAttribute(DATABASE_ID, MESSAGES_COLLECTION_ID, 'createdAt', true);
        console.log('createdAt attribute created');
        
        // Create indexes
        await databases.createIndex(DATABASE_ID, MESSAGES_COLLECTION_ID, 'fromUserId_idx', 'key', ['fromUserId'], false);
        console.log('fromUserId index created');
        
        await databases.createIndex(DATABASE_ID, MESSAGES_COLLECTION_ID, 'toUserId_idx', 'key', ['toUserId'], false);
        console.log('toUserId index created');
        
        await databases.createIndex(DATABASE_ID, MESSAGES_COLLECTION_ID, 'createdAt_idx', 'key', ['createdAt'], false);
        console.log('createdAt index created');
        
        console.log('Messages collection created successfully');
        return true;
      } catch (error) {
        console.error('Error creating messages collection:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          type: error.type,
          response: error.response
        });
        return false;
      }
    }
    console.error('Unexpected error checking messages collection:', error);
    return false;
  }
};

/**
 * Sends a message to another user
 * @param {string} fromUserId - ID of the user sending the message
 * @param {string} toUserId - ID of the user receiving the message
 * @param {string} text - Message text
 * @returns {Promise<object>} - The created message
 */
export const sendMessage = async (fromUserId, toUserId, text) => {
  try {
    console.log('Attempting to send message...');
    
    // Try to create the message directly
    try {
      const message = await databases.createDocument(
        DATABASE_ID,
        MESSAGES_COLLECTION_ID,
        ID.unique(),
        {
          fromUserId,
          toUserId,
          text,
          createdAt: new Date().toISOString()
        }
      );
      
      console.log('Message sent successfully:', message.$id);
      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in sendMessage:', error);
    throw error;
  }
};

/**
 * Gets messages between two users
 * @param {string} userId1 - First user ID
 * @param {string} userId2 - Second user ID
 * @returns {Promise<Array>} - Array of messages
 */
export const getMessages = async (userId1, userId2) => {
  try {
    console.log('Getting messages between users:', userId1, userId2);
    
    // Get messages where either user is the sender or receiver
    try {
      const messages = await databases.listDocuments(
        DATABASE_ID,
        MESSAGES_COLLECTION_ID,
        [
          Query.or([
            Query.and([
              Query.equal('fromUserId', userId1),
              Query.equal('toUserId', userId2)
            ]),
            Query.and([
              Query.equal('fromUserId', userId2),
              Query.equal('toUserId', userId1)
            ])
          ]),
          Query.orderAsc('createdAt'),
          Query.limit(100)
        ]
      );
      
      console.log('Messages retrieved successfully:', messages.documents.length);
      console.log('First message:', messages.documents[0]);
      console.log('Last message:', messages.documents[messages.documents.length - 1]);
      return messages.documents;
    } catch (error) {
      console.error('Error getting messages:', error);
      // If the collection doesn't exist, return an empty array
      if (error.message && error.message.includes('Collection with the requested ID could not be found')) {
        console.log('Messages collection does not exist, returning empty array');
        return [];
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in getMessages:', error);
    return [];
  }
};

// Add this function to test if the Appwrite client is properly initialized
export const testAppwriteConnection = async () => {
  try {
    console.log('Testing Appwrite connection...');
    console.log('Client:', client);
    console.log('Databases:', databases);
    
    // Try to list documents from an existing collection instead of listing collections
    try {
      const documents = await databases.listDocuments(
        DATABASE_ID,
        PROFILES_COLLECTION_ID,
        [Query.limit(1)]
      );
      console.log('Connection successful, found documents:', documents.documents.length);
      return true;
    } catch (error) {
      console.error('Error listing documents:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        type: error.type,
        response: error.response
      });
      return false;
    }
  } catch (error) {
    console.error('Error testing Appwrite connection:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      type: error.type,
      response: error.response
    });
    return false;
  }
};

/**
 * Updates the profiles collection with additional attributes
 * @returns {Promise<boolean>} - True if attributes were added successfully
 */
export const updateProfilesCollection = async () => {
  try {
    console.log('Updating profiles collection attributes...');
    
    // Try to create bio attribute
    try {
      await databases.createStringAttribute(
        DATABASE_ID,
        PROFILES_COLLECTION_ID,
        'bio',
        1000,
        false // not required
      );
      console.log('Bio attribute added successfully');
    } catch (error) {
      if (!error.message.includes('Attribute already exists')) {
        console.error('Error adding bio attribute:', error);
        throw error;
      }
      console.log('Bio attribute already exists');
    }

    // Try to create cleanDate attribute
    try {
      await databases.createDatetimeAttribute(
        DATABASE_ID,
        PROFILES_COLLECTION_ID,
        'cleanDate',
        false // not required
      );
      console.log('CleanDate attribute added successfully');
    } catch (error) {
      if (!error.message.includes('Attribute already exists')) {
        console.error('Error adding cleanDate attribute:', error);
        throw error;
      }
      console.log('CleanDate attribute already exists');
    }

    return true;
  } catch (error) {
    console.error('Error updating profiles collection:', error);
    return false;
  }
};
