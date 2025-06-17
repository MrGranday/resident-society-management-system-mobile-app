




import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet, Modal, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';

// Singleton Socket.IO instance
const socket = global.socket || (global.socket = io('http://localhost:3000', {
  transports: ['websocket', 'polling'],
  forceNew: false,
  pingTimeout: 20000,
  pingInterval: 10000,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  autoConnect: true,
}));

// Environment-based logging
const isDev = process.env.NODE_ENV !== 'production';
const log = (...args) => isDev && console.log(...args);

// Debounce utility
const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

export default function ResidentChatScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [userType] = useState(params.userType || 'resident');
  const [userId, setUserId] = useState('');
  const [societyId, setSocietyId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [chats, setChats] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState({});
  const [messageInput, setMessageInput] = useState('');
  const [manager, setManager] = useState(null);
  const [error, setError] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestRecipient, setRequestRecipient] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [pinnedChats, setPinnedChats] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState({});
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');
  const flatListRef = useRef(null);
  const swipeableRefs = useRef({});

  useEffect(() => {
    const init = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        const storedSocietyId = await AsyncStorage.getItem('societyId');
        const userData = await AsyncStorage.getItem('user');

        log('Init - storedUserId:', storedUserId);
        log('Init - storedSocietyId:', storedSocietyId);
        log('Init - userData:', userData);

        if (!storedSocietyId && userData) {
          const parsedUser = JSON.parse(userData);
          if (parsedUser.society) {
            await AsyncStorage.setItem('societyId', parsedUser.society.toString());
            setSocietyId(parsedUser.society.toString());
          }
        } else {
          setSocietyId(storedSocietyId);
        }

        if (storedUserId && storedSocietyId) {
          setUserId(storedUserId);
          socket.emit('join', storedUserId);
          log('Joined Socket.IO room:', storedUserId);

          const managerResponse = await axios.get(`http://localhost:3000/api/chat/manager?societyId=${storedSocietyId}`);
          log('Manager response:', managerResponse.data);
          setManager(managerResponse.data);

          const chatsResponse = await axios.get(`http://localhost:3000/api/chat/user/${storedUserId}`);
          log('Chats response:', chatsResponse.data);
          setChats(chatsResponse.data.map(chat => ({ ...chat, chatId: chat._id })));

          const requestsResponse = await axios.get(`http://localhost:3000/api/chat/requests/${storedUserId}`);
          log('Requests response:', requestsResponse.data);
          setPendingRequests(requestsResponse.data);
        } else {
          setError('Missing userId or societyId. Please log in again.');
          log('Init error: Missing userId or societyId');
        }
      } catch (error) {
        log('Initialization error:', error.message);
        setError('Failed to initialize chat. Please try again.');
      }
    };
    init();

    socket.on('connect', () => {
      log('Socket.IO connected:', socket.id);
      if (userId) socket.emit('join', userId);
    });

    socket.on('connect_error', (err) => {
      log('Socket.IO connect_error:', err.message);
      setError('Failed to connect to chat server. Retrying...');
    });

    socket.on('chatRequest', ({ from, requestId }) => {
      log('Received chatRequest:', { from, requestId });
      axios.get(`http://localhost:3000/api/chat/requests/${userId}`).then(res => {
        log('Updated pending requests:', res.data);
        setPendingRequests(res.data);
      }).catch(err => log('Fetch requests error:', err.message));
    });

    socket.on('requestAccepted', ({ chatId }) => {
      log('Received requestAccepted:', { chatId });
      axios.get(`http://localhost:3000/api/chat/user/${userId}`).then(res => {
        log('Updated chats:', res.data);
        setChats(res.data.map(chat => ({ ...chat, chatId: chat._id })));
      }).catch(err => log('Fetch chats error:', err.message));
    });

    socket.on('newMessage', ({ chatId, senderId, content, timestamp, status, messageId }) => {
      log('Received newMessage:', { chatId, senderId, content, timestamp, status, messageId });
      setMessages(prev => {
        const chatMessages = [...(prev[chatId] || [])];
        const tempIndex = chatMessages.findIndex(msg => msg.messageId.startsWith('temp-') && msg.content === content && msg.senderId === senderId);
        if (tempIndex !== -1) {
          chatMessages[tempIndex] = { senderId, content, timestamp, status, messageId };
        } else {
          const messageExists = chatMessages.some(msg => msg.messageId === messageId);
          if (!messageExists) {
            chatMessages.push({ senderId, content, timestamp, status, messageId });
          }
        }
        log('Updated messages for chatId:', chatId, chatMessages);
        return { ...prev, [chatId]: chatMessages };
      });
      setChats(prev => {
        const chatIndex = prev.findIndex(chat => chat.chatId === chatId);
        if (chatIndex !== -1) {
          const updatedChats = [...prev];
          updatedChats[chatIndex] = {
            ...updatedChats[chatIndex],
            lastMessage: { content, timestamp },
          };
          log('Updated chats with lastMessage:', updatedChats[chatIndex]);
          return updatedChats;
        }
        log('Chat not found for newMessage:', chatId);
        return prev;
      });
      if (selectedChat?.chatId !== chatId && senderId !== userId) {
        setUnreadMessages(prev => ({ ...prev, [chatId]: true }));
      }
      if (selectedChat?.chatId === chatId) {
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      }
    });

    socket.on('messageDelivered', ({ chatId, messageId }) => {
      log('Received messageDelivered:', { chatId, messageId });
      setMessages(prev => {
        const chatMessages = [...(prev[chatId] || [])];
        const updatedMessages = chatMessages.map(msg =>
          msg.messageId === messageId ? { ...msg, status: 'delivered' } : msg
        );
        log('Updated delivery status for chatId:', chatId, updatedMessages);
        return { ...prev, [chatId]: updatedMessages };
      });
    });

    socket.on('groupCreated', ({ chatId, groupName }) => {
      log('Received groupCreated:', { chatId, groupName });
      setChats(prev => [...prev, { chatId, groupName, isGroup: true, messages: [] }]);
    });

    socket.on('error', ({ message }) => {
      log('Socket.IO error:', message);
      Alert.alert('Error', message);
    });

    socket.on('reconnect', () => {
      log('Socket.IO reconnected:', socket.id);
      if (userId) socket.emit('join', userId);
    });

    socket.on('reconnect_attempt', () => {
      log('Socket.IO attempting to reconnect...');
    });

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('newMessage');
      socket.off('messageDelivered');
      socket.off('chatRequest');
      socket.off('requestAccepted');
      socket.off('groupCreated');
      socket.off('error');
      socket.off('reconnect');
      socket.off('reconnect_attempt');
    };
  }, [userId, selectedChat]);

  const searchUser = async () => {
    if (!searchQuery.trim()) {
      log('Search query is empty');
      setSearchResults([]);
      return;
    }
    if (!societyId) {
      log('SocietyId is missing');
      setError('Society ID not found. Please log in again.');
      return;
    }
    try {
      log('Searching users with query:', searchQuery, 'societyId:', societyId, 'userType:', userType);
      const response = await axios.get(`http://localhost:3000/api/chat/search?query=${encodeURIComponent(searchQuery)}&societyId=${societyId}&userType=${userType}`);
      log('Search response:', response.data);
      setSearchResults(response.data);
    } catch (error) {
      log('Search error:', error.message);
      setError('Failed to search users. Please try again.');
      setSearchResults([]);
    }
  };

  const openRequestModal = debounce((recipient) => {
    log('Attempting to open request modal for:', recipient);
    // Test alert (temporary for debugging)
    log('Testing Alert.alert');
    Alert.alert('Test', 'Alert system is working');

    if (!recipient?._id) {
      log('Invalid recipient:', recipient);
      setErrorModalMessage('Invalid user selected.');
      setShowErrorModal(true);
      return;
    }

    // Prevent self-requests
    if (recipient._id === userId) {
      log('Blocked self-request to:', recipient._id);
      setErrorModalMessage('Blocked self-request: You cannot send a chat request to yourself.');
      setShowErrorModal(true);
      return;
    }

    // Check for existing pending requests
    const hasPendingRequest = pendingRequests.some(
      req => (req.from._id === userId && req.to._id === recipient._id) ||
             (req.from._id === recipient._id && req.to._id === userId)
    );
    if (hasPendingRequest) {
      log('Blocked duplicate request to:', recipient._id);
      setErrorModalMessage('Blocked duplicate request: A chat request is already pending with this user.');
      setShowErrorModal(true);
      return;
    }

    // Check for existing chats
    const hasChat = chats.some(chat =>
      chat.participants.some(p => p._id.toString() === recipient._id && p._id.toString() !== userId)
    );
    if (hasChat) {
      log('Blocked request due to existing chat with:', recipient._id);
      setErrorModalMessage('Blocked request: You already have an active chat with this user.');
      setShowErrorModal(true);
      return;
    }

    setRequestRecipient(recipient);
    setShowRequestModal(true);
    log('Opened request modal for:', recipient._id);
  }, 300);

  const sendChatRequest = async () => {
    try {
      log('Sending chat request:', { from: userId, to: requestRecipient?._id, requestMessage });
      const response = await axios.post('http://localhost:3000/api/chat/request', {
        from: userId,
        to: requestRecipient._id,
        requestMessage,
      });
      log('Chat request sent:', response.data);
      socket.emit('chatRequest', {
        from: userId,
        to: requestRecipient._id,
        requestId: response.data.requestId,
      });
      setShowRequestModal(false);
      setRequestMessage('');
      setRequestRecipient(null);
      Alert.alert('Success', 'Chat request sent');
    } catch (error) {
      log('Request error:', error.message);
      setError('Failed to send chat request.');
    }
  };

  const acceptChatRequest = async (requestId) => {
    try {
      log('Accepting chat request:', requestId);
      const response = await axios.post('http://localhost:3000/api/chat/request/accept', { requestId });
      log('Chat request accepted:', response.data);
      setPendingRequests(prev => prev.filter(req => req._id !== requestId));
      const chatsResponse = await axios.get(`http://localhost:3000/api/chat/user/${userId}`);
      setChats(chatsResponse.data.map(chat => ({ ...chat, chatId: chat._id })));
      socket.emit('requestAccepted', { chatId: response.data.chatId });
    } catch (error) {
      log('Accept request error:', error.message);
      setError('Failed to accept chat request.');
    }
  };

  const rejectChatRequest = async (requestId) => {
    try {
      log('Rejecting chat request:', requestId);
      await axios.post('http://localhost:3000/api/chat/request/reject', { requestId });
      log('Chat request rejected:', requestId);
      setPendingRequests(prev => prev.filter(req => req._id !== requestId));
      Alert.alert('Success', 'Chat request rejected');
    } catch (error) {
      log('Reject request error:', error.message);
      setError('Failed to reject chat request.');
    }
  };

  const deleteChat = async (chatId) => {
    try {
      log('Deleting chat:', chatId);
      await axios.delete(`http://localhost:3000/api/chat/${chatId}`);
      log('Chat deleted:', chatId);
      setChats(prev => prev.filter(chat => chat.chatId !== chatId));
      setMessages(prev => {
        const updatedMessages = { ...prev };
        delete updatedMessages[chatId];
        return updatedMessages;
      });
      setUnreadMessages(prev => {
        const updatedUnread = { ...prev };
        delete updatedUnread[chatId];
        return updatedUnread;
      });
      if (selectedChat?.chatId === chatId) {
        setSelectedChat(null);
      }
      Alert.alert('Success', 'Chat deleted');
    } catch (error) {
      log('Delete chat error:', error.message);
      setError('Failed to delete chat.');
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedChat) {
      log('Cannot send message: Empty input or no chat selected');
      return;
    }
    try {
      if (!socket.connected) {
        log('Socket.IO is disconnected. Attempting to reconnect...');
        socket.connect();
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Reconnection timed out')), 5000);
          socket.once('connect', () => {
            log('Socket.IO reconnected for sendMessage:', socket.id);
            clearTimeout(timeout);
            resolve();
          });
          socket.once('connect_error', (err) => {
            log('Reconnection failed:', err.message);
            clearTimeout(timeout);
            reject(new Error('Failed to reconnect to server'));
          });
        });
      }

      const tempMessageId = `temp-${Date.now()}`;
      const newMessage = {
        chatId: selectedChat.chatId,
        senderId: userId,
        content: messageInput,
        timestamp: new Date().toISOString(),
        status: 'sent',
        messageId: tempMessageId,
      };
      setMessages(prev => ({
        ...prev,
        [selectedChat.chatId]: [...(prev[selectedChat.chatId] || []), newMessage],
      }));
      log('Sending message:', { chatId: selectedChat.chatId, senderId: userId, content: messageInput, socketConnected: socket.connected });
      socket.emit('sendMessage', {
        chatId: selectedChat.chatId,
        senderId: userId,
        content: messageInput,
      }, (response) => {
        if (response && response.error) {
          log('Server responded with error:', response.error);
          Alert.alert('Error', 'Failed to send message: ' + response.error);
          setMessages(prev => ({
            ...prev,
            [selectedChat.chatId]: (prev[selectedChat.chatId] || []).filter(msg => msg.messageId !== tempMessageId),
          }));
        } else {
          log('Server acknowledged sendMessage:', response);
        }
      });
      setMessageInput('');
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error) {
      log('Send message error:', error.message);
      Alert.alert('Error', 'Failed to send message. Please check your connection.');
      setMessages(prev => ({
        ...prev,
        [selectedChat.chatId]: (prev[selectedChat.chatId] || []).filter(msg => msg.messageId !== tempMessageId),
      }));
    }
  };

  const selectChat = async (chat) => {
    try {
      log('Selecting chat:', chat.chatId);
      const messagesResponse = await axios.get(`http://localhost:3000/api/chat/messages/${chat.chatId}`);
      log('Messages response:', messagesResponse.data);
      const newMessages = messagesResponse.data.map(msg => ({
        senderId: msg.sender._id.toString(),
        content: msg.content,
        timestamp: msg.timestamp,
        status: msg.status,
        messageId: msg._id.toString(),
      }));
      setMessages(prev => ({
        ...prev,
        [chat.chatId]: newMessages,
      }));
      setSelectedChat(chat);
      setUnreadMessages(prev => ({
        ...prev,
        [chat.chatId]: false,
      }));
      log('Messages state after select:', newMessages);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error) {
      log('Messages fetch error:', error.message);
      setError('Failed to fetch messages.');
    }
  };

  const togglePinChat = (chatId) => {
    log('Toggling pin for chat:', chatId);
    setPinnedChats(prev => {
      if (prev.includes(chatId)) {
        return prev.filter(id => id !== chatId);
      } else {
        return [chatId, ...prev];
      }
    });
  };

  const getChatName = (chat) => {
    if (chat.isGroup) return chat.groupName || 'Group Chat';
    const otherParticipant = chat.participants.find(p => p._id.toString() !== userId);
    return otherParticipant?.name || 'Unknown';
  };

  const sortedChats = [...chats].sort((a, b) => {
    if (pinnedChats.includes(a.chatId) && !pinnedChats.includes(b.chatId)) return -1;
    if (!pinnedChats.includes(a.chatId) && pinnedChats.includes(b.chatId)) return 1;
    const aTime = a.lastMessage?.timestamp || a.createdAt || 0;
    const bTime = b.lastMessage?.timestamp || b.createdAt || 0;
    return new Date(bTime) - new Date(aTime);
  });

  const renderRightActions = (chatId) => (
    <TouchableOpacity style={styles.deleteButton} onPress={() => deleteChat(chatId)}>
      <Ionicons name="trash" size={24} color="#fff" />
      <Text style={styles.deleteButtonText}>Delete</Text>
    </TouchableOpacity>
  );

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.loginButton} onPress={() => router.replace('/LoginScreen')}>
          <Text style={styles.loginButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!userId || !societyId) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Loading user data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!selectedChat ? (
        <>
          <View style={styles.header}>
            <Text style={styles.headerText}>Chats</Text>
            <TouchableOpacity onPress={() => {
              log('Search icon pressed');
              setSearchQuery('');
            }}>
              <Ionicons name="search" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              placeholder="Search by phone number"
              value={searchQuery}
              onChangeText={(text) => {
                log('Search query changed:', text);
                setSearchQuery(text);
                if (text.trim()) {
                  searchUser();
                } else {
                  setSearchResults([]);
                }
              }}
              style={styles.searchInput}
              autoFocus={false}
            />
            <TouchableOpacity style={styles.searchButton} onPress={() => {
              log('Search button pressed');
              searchUser();
            }}>
              <Ionicons name="search" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {searchResults.length > 0 && (
            <FlatList
              data={searchResults}
              keyExtractor={item => item._id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => openRequestModal(item)} style={styles.chatItem}>
                  <View style={styles.chatAvatar}>
                    <Text style={styles.avatarText}>{item.name[0]}</Text>
                  </View>
                  <View style={styles.chatInfo}>
                    <Text style={styles.chatName}>{item.name}</Text>
                    <Text style={styles.chatPhone}>{item.phoneNumber}</Text>
                  </View>
                </TouchableOpacity>
              )}
              style={styles.searchResults}
            />
          )}

          {manager && !searchQuery && (
            <TouchableOpacity
              onPress={() => openRequestModal(manager)}
              style={[styles.chatItem, styles.managerButton]}
            >
              <View style={[styles.chatAvatar, styles.managerAvatar]}>
                <Ionicons name="person-circle" size={40} color="#007bff" />
              </View>
              <View style={styles.chatInfo}>
                <Text style={styles.chatName}>System Manager ({manager.name})</Text>
                <Text style={styles.chatPhone}>Contact for assistance</Text>
              </View>
            </TouchableOpacity>
          )}

          {!searchQuery && pendingRequests.length > 0 && (
            <View style={styles.requestsContainer}>
              <Text style={styles.sectionHeader}>Pending Requests</Text>
              <FlatList
                data={pendingRequests}
                keyExtractor={item => item._id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.requestItem}>
                    <View style={styles.chatAvatar}>
                      <Text style={styles.avatarText}>{item.from.name[0]}</Text>
                    </View>
                    <View style={styles.requestInfo}>
                      <Text style={styles.chatName}>{item.from.name}</Text>
                      {item.requestMessage && (
                        <Text style={styles.requestMessage}>{item.requestMessage}</Text>
                      )}
                      <View style={styles.requestActions}>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.acceptButton]}
                          onPress={() => acceptChatRequest(item._id)}
                        >
                          <Text style={styles.actionText}>Accept</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.rejectButton]}
                          onPress={() => rejectChatRequest(item._id)}
                        >
                          <Text style={styles.actionText}>Reject</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}
              />
            </View>
          )}

          {!searchQuery && (
            <FlatList
              data={sortedChats}
              keyExtractor={item => item.chatId.toString()}
              renderItem={({ item }) => (
                <Swipeable
                  ref={ref => (swipeableRefs.current[item.chatId] = ref)}
                  renderRightActions={() => renderRightActions(item.chatId)}
                  onSwipeableWillOpen={() => {
                    Object.keys(swipeableRefs.current).forEach(key => {
                      if (key !== item.chatId && swipeableRefs.current[key]) {
                        swipeableRefs.current[key].close();
                      }
                    });
                  }}
                >
                  <TouchableOpacity onPress={() => selectChat(item)} style={styles.chatItem}>
                    <View style={styles.chatAvatar}>
                      <Text style={styles.avatarText}>{getChatName(item)[0]}</Text>
                      {unreadMessages[item.chatId] && <View style={styles.unreadDot} />}
                    </View>
                    <View style={styles.chatInfo}>
                      <View style={styles.chatHeaderRow}>
                        <Text style={styles.chatName}>{getChatName(item)}</Text>
                        <Text style={styles.chatTime}>
                          {item.lastMessage && new Date(item.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                      <View style={styles.chatPreviewRow}>
                        <Text numberOfLines={1} style={styles.chatPreview}>
                          {item.lastMessage?.content || 'Start a conversation'}
                        </Text>
                        {pinnedChats.includes(item.chatId) && (
                          <Ionicons name="pin" size={16} color="#007bff" />
                        )}
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => togglePinChat(item.chatId)} style={styles.pinButton}>
                      <Ionicons name={pinnedChats.includes(item.chatId) ? 'pin' : 'pin-outline'} size={20} color="#007bff" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                </Swipeable>
              )}
            />
          )}

          <Modal visible={showRequestModal} animationType="fade" transparent>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalContainer}
            >
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Send Chat Request</Text>
                <Text style={styles.modalSubtitle}>To: {requestRecipient?.name}</Text>
                <TextInput
                  placeholder="Type a message (e.g., Hi, I'm sending this request)"
                  value={requestMessage}
                  onChangeText={setRequestMessage}
                  style={styles.modalInput}
                  multiline
                  maxLength={200}
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalCancelButton]}
                    onPress={() => setShowRequestModal(false)}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalSendButton]}
                    onPress={sendChatRequest}
                    disabled={!requestMessage.trim()}
                  >
                    <Text style={styles.modalButtonText}>Send</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </Modal>

          <Modal
            animationType="slide"
            transparent={true}
            visible={showErrorModal}
            onRequestClose={() => setShowErrorModal(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Error</Text>
                <Text style={styles.modalText}>{errorModalMessage}</Text>
                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setShowErrorModal(false)}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </>
      ) : (
        <View style={styles.chatContainer}>
          <View style={styles.chatHeader}>
            <TouchableOpacity style={styles.backButton} onPress={() => setSelectedChat(null)}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.chatAvatar}>
              <Text style={styles.avatarText}>{getChatName(selectedChat)[0]}</Text>
            </View>
            <View style={styles.chatHeaderInfo}>
              <Text style={styles.chatHeaderText}>{getChatName(selectedChat)}</Text>
            </View>
          </View>

          <FlatList
            ref={flatListRef}
            data={(messages[selectedChat.chatId] || []).slice()}
            keyExtractor={item => item.messageId}
            renderItem={({ item }) => {
              log('Rendering message:', item);
              const messageStyle = [
                styles.messageBubble,
                item.senderId === userId ? styles.sentMessage : styles.receivedMessage
              ];
              return (
                <View style={messageStyle}>
                  <Text style={styles.messageText}>{item.content}</Text>
                  <View style={styles.messageMeta}>
                    <Text style={styles.messageTime}>
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
              );
            }}
            style={styles.messageList}
            contentContainerStyle={styles.messageListContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={() => (
              <Text style={styles.emptyMessageText}>Start a conversation</Text>
            )}
            extraData={messages[selectedChat.chatId] || []}
          />

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.messageInputContainer}
          >
            <TextInput
              placeholder="Type a message"
              value={messageInput}
              onChangeText={setMessageInput}
              style={styles.messageInput}
              multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={!messageInput.trim()}>
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#007bff',
    elevation: 8,
    shadowColor: '#00000030',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e6ef',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f5f7fb',
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
    fontSize: 16,
    color: '#333',
  },
  searchButton: {
    backgroundColor: '#007bff',
    borderRadius: 20,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchResults: {
    backgroundColor: '#ffffff',
  },
  requestsContainer: {
    padding: 10,
    backgroundColor: '#ffffff',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007bff',
    marginBottom: 10,
  },
  requestItem: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e6ef',
    alignItems: 'center',
  },
  requestInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  requestMessage: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    marginBottom: 10,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e6ef',
    alignItems: 'center',
  },
  chatAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    position: 'relative',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  managerAvatar: {
    backgroundColor: 'transparent',
  },
  chatInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  chatPhone: {
    fontSize: 14,
    color: '#666',
  },
  chatPreviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatPreview: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginRight: 10,
  },
  chatTime: {
    fontSize: 12,
    color: '#999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007bff',
    position: 'absolute',
    top: 5,
    right: 5,
  },
  managerButton: {
    backgroundColor: '#f0f8ff',
  },
  requestActions: {
    flexDirection: 'row',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginLeft: 10,
  },
  acceptButton: {
    backgroundColor: '#007bff',
  },
  rejectButton: {
    backgroundColor: '#dc3545',
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  pinButton: {
    padding: 10,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    flexDirection: 'row',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 5,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#007bff',
    elevation: 8,
    shadowColor: '#00000030',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  chatHeaderInfo: {
    flex: 1,
    marginLeft: 10,
  },
  chatHeaderText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: 10,
    paddingBottom: 20,
    flexGrow: 1,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#00000030',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#e3f2fd',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f5f7fb',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  messageMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 12,
    color: '#999',
  },
  emptyMessageText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginTop: 20,
  },
  messageInputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e6ef',
    alignItems: 'center',
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#f5f7fb',
    borderRadius: 20,
    padding: 12,
    fontSize: 16,
    maxHeight: 120,
    color: '#333',
  },
  sendButton: {
    backgroundColor: '#007bff',
    borderRadius: 20,
    padding: 12,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#00000030',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  modalInput: {
    backgroundColor: '#f5f7fb',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalCancelButton: {
    backgroundColor: '#dc3545',
  },
  modalSendButton: {
    backgroundColor: '#007bff',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
});