/**
 * WebRTC Signaling Server Test Script
 * 
 * Tests the WebRTC signaling server functionality
 */

const io = require('socket.io-client');

const SERVER_URL = 'http://localhost:3002';

console.log('🧪 WebRTC Signaling Server Test\n');
console.log('================================\n');

// Create two test clients
let client1, client2;
let client1Id = 'test-user-1';
let client2Id = 'test-user-2';

function createClient(userId, userName) {
  const socket = io(SERVER_URL, {
    transports: ['websocket', 'polling'],
    reconnection: false,
  });

  return new Promise((resolve, reject) => {
    socket.on('connect', () => {
      console.log(`✅ ${userName} connected: ${socket.id}`);
      
      // Register user
      socket.emit('register', { userId, userName });
    });

    socket.on('registered', (data) => {
      console.log(`✅ ${userName} registered successfully`);
      console.log(`   Online users: ${data.onlineUsers.length}`);
      resolve(socket);
    });

    socket.on('connect_error', (error) => {
      console.error(`❌ ${userName} connection error:`, error.message);
      reject(error);
    });

    socket.on('error', (error) => {
      console.error(`❌ ${userName} error:`, error.message);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 ${userName} disconnected`);
    });
  });
}

async function testSignaling() {
  try {
    console.log('Step 1: Connecting clients...\n');
    
    // Connect both clients
    client1 = await createClient(client1Id, 'Alice');
    client2 = await createClient(client2Id, 'Bob');
    
    console.log('\n✅ Both clients connected\n');
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Step 2: Setting up call event listeners...\n');
    
    // Set up client2 to receive incoming call
    client2.on('incoming-call', (data) => {
      console.log(`📞 Bob received incoming call from: ${data.from}`);
      console.log(`   Signal type: ${data.signal.type}`);
      
      // Simulate answering the call
      setTimeout(() => {
        console.log('\n✅ Bob answering call...\n');
        client2.emit('answer-call', {
          to: data.from,
          signal: { type: 'answer', sdp: 'mock-answer-sdp' }
        });
      }, 1000);
    });
    
    // Set up client1 to receive call acceptance
    client1.on('call-accepted', (data) => {
      console.log(`✅ Alice received call acceptance from: ${data.from}`);
      console.log(`   Signal type: ${data.signal.type}`);
      console.log('\n🎉 Call established!\n');
      
      // End call after a bit
      setTimeout(() => {
        console.log('🔚 Alice ending call...\n');
        client1.emit('end-call', { to: client2Id });
      }, 2000);
    });
    
    // Set up client2 to receive call end
    client2.on('call-ended', (data) => {
      console.log(`🔚 Bob received call end from: ${data.from}`);
      console.log('\n✅ Call ended successfully\n');
      
      // Clean up
      setTimeout(() => {
        console.log('🧹 Cleaning up...\n');
        client1.close();
        client2.close();
        
        setTimeout(() => {
          console.log('✅ Test completed successfully!\n');
          process.exit(0);
        }, 1000);
      }, 1000);
    });
    
    console.log('Step 3: Alice calling Bob...\n');
    
    // Client1 calls client2
    client1.emit('call-user', {
      to: client2Id,
      signal: { type: 'offer', sdp: 'mock-offer-sdp' }
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Test call rejection
async function testCallRejection() {
  try {
    console.log('\n\n🧪 Testing Call Rejection\n');
    console.log('================================\n');
    
    console.log('Step 1: Connecting clients...\n');
    
    client1 = await createClient('test-user-3', 'Charlie');
    client2 = await createClient('test-user-4', 'Diana');
    
    console.log('\n✅ Both clients connected\n');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Step 2: Setting up rejection test...\n');
    
    // Set up client2 to reject incoming call
    client2.on('incoming-call', (data) => {
      console.log(`📞 Diana received incoming call from: ${data.from}`);
      
      setTimeout(() => {
        console.log('\n❌ Diana rejecting call...\n');
        client2.emit('reject-call', { to: data.from });
      }, 1000);
    });
    
    // Set up client1 to receive rejection
    client1.on('call-rejected', (data) => {
      console.log(`❌ Charlie received call rejection from: ${data.from}`);
      console.log('\n✅ Rejection handled successfully\n');
      
      // Clean up
      setTimeout(() => {
        console.log('🧹 Cleaning up...\n');
        client1.close();
        client2.close();
        
        setTimeout(() => {
          console.log('✅ All tests completed successfully!\n');
          process.exit(0);
        }, 1000);
      }, 1000);
    });
    
    console.log('Step 3: Charlie calling Diana...\n');
    
    client1.emit('call-user', {
      to: 'test-user-4',
      signal: { type: 'offer', sdp: 'mock-offer-sdp' }
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests
console.log('🚀 Starting WebRTC Signaling Tests\n');
console.log('Make sure the server is running on port 3002\n');

testSignaling().then(() => {
  // Run rejection test after main test
  setTimeout(() => {
    testCallRejection();
  }, 2000);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n🛑 Test interrupted\n');
  if (client1) client1.close();
  if (client2) client2.close();
  process.exit(0);
});
