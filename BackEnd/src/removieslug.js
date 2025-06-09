// Script để chuyển đổi ID của movies từ ObjectId thành slug
// Chạy script này trong MongoDB shell hoặc Node.js với MongoDB driver

// Hàm tạo slug từ tiêu đề
function createSlug(title) {
  return title
    .toLowerCase()
    .trim()
    // Chuyển đổi các ký tự có dấu tiếng Việt
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Thay thế các ký tự đặc biệt bằng dấu gạch ngang
    .replace(/[^a-z0-9\s-]/g, '')
    // Thay thế khoảng trắng bằng dấu gạch ngang
    .replace(/\s+/g, '-')
    // Loại bỏ dấu gạch ngang liên tiếp
    .replace(/-+/g, '-')
    // Loại bỏ dấu gạch ngang ở đầu và cuối
    .replace(/^-+|-+$/g, '');
}

// Hàm đảm bảo slug là duy nhất
function ensureUniqueSlug(baseSlug, existingSlugs) {
  let slug = baseSlug;
  let counter = 1;
  
  while (existingSlugs.has(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  existingSlugs.add(slug);
  return slug;
}

// Script chính để cập nhật collection
async function updateMovieIds() {
  // Kết nối đến MongoDB (thay đổi connection string theo môi trường của bạn)
  const { MongoClient } = require('mongodb');
  const uri = 'mongodb+srv://tinh24:O82gXvqihFzHcmZ7@nckh.v4eril4.mongodb.net/'; // Thay đổi URI này
  const dbName = '3ConGianPhim'; // Thay đổi tên database
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db(dbName);
    const moviesCollection = db.collection('movies');
    
    // Lấy tất cả movies
    const movies = await moviesCollection.find({}).toArray();
    console.log(`Tìm thấy ${movies.length} phim để cập nhật`);
    
    // Tạo một collection mới với slug IDs
    const newMoviesCollection = db.collection('movies_new');
    
    // Xóa collection mới nếu đã tồn tại
    await newMoviesCollection.drop().catch(() => {});
    
    const existingSlugs = new Set();
    const newMovies = [];
    
    // Xử lý từng phim
    for (const movie of movies) {
      const baseSlug = createSlug(movie.title);
      const uniqueSlug = ensureUniqueSlug(baseSlug, existingSlugs);
      
      // Tạo document mới với slug ID
      const newMovie = {
        ...movie,
        _id: uniqueSlug,
        oldId: movie._id // Lưu ID cũ để tham chiếu
      };
      
      delete newMovie._id; // Xóa _id cũ
      newMovie._id = uniqueSlug; // Gán _id mới
      
      newMovies.push(newMovie);
      
      console.log(`${movie.title} -> ${uniqueSlug}`);
    }
    
    // Insert tất cả movies mới
    if (newMovies.length > 0) {
      await newMoviesCollection.insertMany(newMovies);
      console.log(`Đã tạo ${newMovies.length} phim với slug IDs`);
    }
    
    // Hiển thị thống kê
    console.log('\n=== THỐNG KÊ ===');
    console.log(`Tổng số phim đã xử lý: ${movies.length}`);
    console.log(`Collection mới: movies_new`);
    console.log('\n=== MỘT SỐ VÍ DỤ ===');
    
    const samples = await newMoviesCollection.find({}).limit(5).toArray();
    samples.forEach(movie => {
      console.log(`ID: ${movie._id} | Title: ${movie.title}`);
    });
    
    console.log('\n=== HƯỚNG DẪN TIẾP THEO ===');
    console.log('1. Kiểm tra collection "movies_new" để đảm bảo dữ liệu chính xác');
    console.log('2. Backup collection "movies" gốc');
    console.log('3. Rename "movies_new" thành "movies"');
    console.log('4. Cập nhật các collection khác có tham chiếu đến movie IDs');
    
  } catch (error) {
    console.error('Lỗi:', error);
  } finally {
    await client.close();
  }
}

// Script để hoàn tất việc chuyển đổi (chạy sau khi kiểm tra)
async function finalizeConversion() {
  const { MongoClient } = require('mongodb');
  const uri = 'mongodb+srv://tinh24:O82gXvqihFzHcmZ7@nckh.v4eril4.mongodb.net/';
  const dbName = '3ConGianPhim';
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db(dbName);
    
    // Backup collection gốc
    await db.collection('movies').rename('movies_backup');
    console.log('Đã backup collection gốc thành "movies_backup"');
    
    // Rename collection mới
    await db.collection('movies_new').rename('movies');
    console.log('Đã chuyển "movies_new" thành "movies"');
    
    console.log('Hoàn tất chuyển đổi!');
    
  } catch (error) {
    console.error('Lỗi khi hoàn tất:', error);
  } finally {
    await client.close();
  }
}

// Hàm test để kiểm tra slug generation
function testSlugGeneration() {
  const testTitles = [
    'One Piece',
    'Naruto Shippuden',
    'Attack on Titan',
    'Dragon Ball Z',
    'Your Name',
    'Spirited Away',
    'Demon Slayer: Kimetsu no Yaiba',
    'My Hero Academia',
    'Death Note',
    'Fullmetal Alchemist: Brotherhood'
  ];
  
  console.log('=== TEST SLUG GENERATION ===');
  testTitles.forEach(title => {
    console.log(`"${title}" -> "${createSlug(title)}"`);
  });
}

// Export functions
module.exports = {
  createSlug,
  ensureUniqueSlug,
  updateMovieIds,
  finalizeConversion,
  testSlugGeneration
};

// Nếu chạy trực tiếp
if (require.main === module) {
  console.log('Chọn một tùy chọn:');
  console.log('1. Test slug generation: node script.js test');
  console.log('2. Update movie IDs: node script.js update');
  console.log('3. Finalize conversion: node script.js finalize');
  
  const command = process.argv[2];
  
  switch (command) {
    case 'test':
      testSlugGeneration();
      break;
    case 'update':
      updateMovieIds();
      break;
    case 'finalize':
      finalizeConversion();
      break;
    default:
      console.log('Vui lòng chỉ định command: test, update, hoặc finalize');
  }
}