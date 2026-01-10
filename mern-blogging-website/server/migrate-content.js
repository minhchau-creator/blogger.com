import mongoose from 'mongoose';
import 'dotenv/config';
import Blog from './Schema/Blog.js';

const migrateContent = async () => {
    try {
        console.log('🔄 Starting content migration...');
        console.log('📡 Connecting to database...');
        
        await mongoose.connect(process.env.DB_LOCATION, {
            autoIndex: true
        });
        
        console.log('✅ Database connected successfully');
        
        // Tìm tất cả blogs
        const allBlogs = await Blog.find({});
        console.log(`📊 Found ${allBlogs.length} blogs in database`);
        
        let migratedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;
        
        for (const blog of allBlogs) {
            try {
                // Kiểm tra nếu content là array và có phần tử đầu tiên
                if (Array.isArray(blog.content) && blog.content.length > 0) {
                    const firstElement = blog.content[0];
                    
                    // Kiểm tra nếu phần tử đầu tiên có cấu trúc EditorJS
                    if (firstElement && typeof firstElement === 'object' && firstElement.blocks) {
                        console.log(`\n🔧 Migrating blog: ${blog.blog_id}`);
                        console.log(`   Title: ${blog.title}`);
                        console.log(`   Old content type: Array with ${blog.content.length} elements`);
                        
                        // Update content từ array sang object
                        blog.content = firstElement;
                        await blog.save();
                        
                        console.log(`   ✅ Migrated successfully`);
                        console.log(`   New content type: Object with ${firstElement.blocks.length} blocks`);
                        migratedCount++;
                    } else {
                        console.log(`\n⚠️  Skipping blog ${blog.blog_id}: Array but no valid EditorJS structure`);
                        skippedCount++;
                    }
                } else if (Array.isArray(blog.content) && blog.content.length === 0) {
                    // Array rỗng, convert thành object rỗng
                    console.log(`\n🔧 Fixing empty array for blog: ${blog.blog_id}`);
                    blog.content = { blocks: [] };
                    await blog.save();
                    console.log(`   ✅ Converted empty array to empty object`);
                    migratedCount++;
                } else if (blog.content && blog.content.blocks) {
                    // Đã đúng format, skip
                    skippedCount++;
                } else {
                    console.log(`\n⚠️  Unknown format for blog ${blog.blog_id}`);
                    console.log(`   Content type: ${typeof blog.content}`);
                    console.log(`   Is array: ${Array.isArray(blog.content)}`);
                    skippedCount++;
                }
            } catch (err) {
                console.error(`\n❌ Error migrating blog ${blog.blog_id}:`, err.message);
                errorCount++;
            }
        }
        
        console.log('\n' + '='.repeat(50));
        console.log('📊 Migration Summary:');
        console.log('='.repeat(50));
        console.log(`✅ Successfully migrated: ${migratedCount} blogs`);
        console.log(`⏭️  Skipped (already correct): ${skippedCount} blogs`);
        console.log(`❌ Errors: ${errorCount} blogs`);
        console.log('='.repeat(50));
        
        console.log('\n✨ Migration completed!');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Database disconnected');
        process.exit(0);
    }
};

migrateContent();
