const { MongoClient } = require('mongodb');

// Cấu hình kết nối MongoDB
const MONGO_URI = 'mongodb+srv://tinh24:O82gXvqihFzHcmZ7@nckh.v4eril4.mongodb.net/'; // Thay đổi URI theo database của bạn
const DB_NAME = '3ConGianPhim'; // Thay đổi tên database

async function migrateMovieIds() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('Đã kết nối MongoDB thành công');
    
    const db = client.db(DB_NAME);
    const usersCollection = db.collection('users');
    const moviesCollection = db.collection('movies');
    const moviesBackupCollection = db.collection('movies_backup');
    
    // Bước 1: Tạo mapping từ ObjectId cũ sang slug mới
    console.log('Đang tạo mapping ObjectId -> Slug...');
    const idToSlugMap = new Map();
    
    // Lấy tất cả movies có oldId từ collection movies
    const moviesWithOldId = await moviesCollection.find({ oldId: { $exists: true } }).toArray();
    
    for (const movie of moviesWithOldId) {
      const oldId = movie.oldId.toString();
      const slug = movie._id;
      idToSlugMap.set(oldId, slug);
      console.log(`Mapping: ${oldId} -> ${slug}`);
    }
    
    // Nếu không có oldId field, sử dụng title để match
    if (idToSlugMap.size === 0) {
      console.log('Không tìm thấy oldId field, sử dụng title để mapping...');
      const moviesBackup = await moviesBackupCollection.find().toArray();
      const movies = await moviesCollection.find().toArray();
      
      for (const backupMovie of moviesBackup) {
        const matchingMovie = movies.find(m => m.title === backupMovie.title);
        if (matchingMovie) {
          const oldId = backupMovie._id.toString();
          const slug = matchingMovie._id;
          idToSlugMap.set(oldId, slug);
          console.log(`Mapping by title: ${oldId} -> ${slug} (${backupMovie.title})`);
        }
      }
    }
    
    console.log(`Đã tạo ${idToSlugMap.size} mappings`);
    
    // Bước 2: Cập nhật users
    console.log('Đang cập nhật users...');
    const users = await usersCollection.find().toArray();
    let updatedUsersCount = 0;
    
    for (const user of users) {
      let userUpdated = false;
      const updateData = {};
      
      // Cập nhật favorites
      if (user.favorites && user.favorites.length > 0) {
        const newFavorites = [];
        let favoritesUpdated = false;
        
        for (const favoriteId of user.favorites) {
          const oldIdStr = favoriteId.toString();
          const newSlug = idToSlugMap.get(oldIdStr);
          
          if (newSlug) {
            newFavorites.push(newSlug);
            console.log(`User ${user.username}: Favorite ${oldIdStr} -> ${newSlug}`);
            favoritesUpdated = true;
          } else {
            // Giữ nguyên nếu không tìm thấy mapping
            newFavorites.push(favoriteId);
            console.log(`User ${user.username}: Không tìm thấy mapping cho favorite ${oldIdStr}`);
          }
        }
        
        if (favoritesUpdated) {
          updateData.favorites = newFavorites;
          userUpdated = true;
        }
      }
      
      // Cập nhật history
      if (user.history && user.history.length > 0) {
        const newHistory = [];
        let historyUpdated = false;
        
        for (const historyItem of user.history) {
          const newHistoryItem = { ...historyItem };
          
          if (historyItem.movie) {
            const oldIdStr = historyItem.movie.toString();
            const newSlug = idToSlugMap.get(oldIdStr);
            
            if (newSlug) {
              newHistoryItem.movie = newSlug;
              console.log(`User ${user.username}: History movie ${oldIdStr} -> ${newSlug}`);
              historyUpdated = true;
            } else {
              console.log(`User ${user.username}: Không tìm thấy mapping cho history movie ${oldIdStr}`);
            }
          }
          
          newHistory.push(newHistoryItem);
        }
        
        if (historyUpdated) {
          updateData.history = newHistory;
          userUpdated = true;
        }
      }
      
      // Thực hiện cập nhật user
      if (userUpdated) {
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: updateData }
        );
        updatedUsersCount++;
        console.log(`✅ Đã cập nhật user: ${user.username}`);
      } else {
        console.log(`⚠️ Không có thay đổi cho user: ${user.username}`);
      }
    }
    
    console.log(`\n🎉 Migration hoàn thành!`);
    console.log(`- Tổng số mappings: ${idToSlugMap.size}`);
    console.log(`- Số users đã cập nhật: ${updatedUsersCount}/${users.length}`);
    
  } catch (error) {
    console.error('❌ Lỗi trong quá trình migration:', error);
  } finally {
    await client.close();
    console.log('Đã đóng kết nối MongoDB');
  }
}

// Hàm kiểm tra dữ liệu trước khi migration
async function checkDataBeforeMigration() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    
    console.log('=== KIỂM TRA DỮ LIỆU TRƯỚC KHI MIGRATION ===');
    
    // Kiểm tra số lượng documents
    const usersCount = await db.collection('users').countDocuments();
    const moviesCount = await db.collection('movies').countDocuments();
    const moviesBackupCount = await db.collection('movies_backup').countDocuments();
    
    console.log(`Users: ${usersCount} documents`);
    console.log(`Movies: ${moviesCount} documents`);
    console.log(`Movies Backup: ${moviesBackupCount} documents`);
    
    // Kiểm tra structure của movies
    const sampleMovie = await db.collection('movies').findOne();
    const hasOldId = sampleMovie && sampleMovie.oldId;
    console.log(`Movies có field 'oldId': ${hasOldId ? 'Có' : 'Không'}`);
    
    // Kiểm tra sample user
    const sampleUser = await db.collection('users').findOne({ 
      $or: [
        { favorites: { $exists: true, $ne: [] } },
        { history: { $exists: true, $ne: [] } }
      ]
    });
    
    if (sampleUser) {
      console.log(`Sample user: ${sampleUser.username}`);
      console.log(`- Favorites: ${sampleUser.favorites ? sampleUser.favorites.length : 0}`);
      console.log(`- History: ${sampleUser.history ? sampleUser.history.length : 0}`);
    }
    
  } catch (error) {
    console.error('Lỗi kiểm tra dữ liệu:', error);
  } finally {
    await client.close();
  }
}

// Hàm main
async function main() {
  console.log('🚀 Bắt đầu quá trình migration Movie IDs');
  
  // Kiểm tra dữ liệu trước
  await checkDataBeforeMigration();
  
  // Hỏi xác nhận
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('\nBạn có muốn tiến hành migration không? (y/N): ', async (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      await migrateMovieIds();
    } else {
      console.log('Migration đã được hủy');
    }
    rl.close();
  });
}

// Chạy script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  migrateMovieIds,
  checkDataBeforeMigration
};