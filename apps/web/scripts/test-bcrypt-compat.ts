import bcryptjs from 'bcryptjs';
// We dynamic import or import directly. Let's import directly.
import bcrypt from 'bcrypt';

async function testCompat() {
  const password = "mySecurePassword123";
  
  console.log("Testing bcrypt compatibility...");
  
  try {
    // 1. Hash with bcryptjs, verify with bcrypt
    const hashJs = await bcryptjs.hash(password, 12);
    const matchWithBcrypt = await bcrypt.compare(password, hashJs);
    console.log(`Hash with bcryptjs (web), verify with bcrypt (mobile): ${matchWithBcrypt ? "SUCCESS" : "FAILED"}`);
    
    // 2. Hash with bcrypt, verify with bcryptjs
    const hashNative = await bcrypt.hash(password, 12);
    const matchWithBcryptJs = await bcryptjs.compare(password, hashNative);
    console.log(`Hash with bcrypt (mobile), verify with bcryptjs (web): ${matchWithBcryptJs ? "SUCCESS" : "FAILED"}`);
    
    if (matchWithBcrypt && matchWithBcryptJs) {
      console.log("✔ Bcrypt compatibility verified successfully! Both engines can cross-verify hashes.");
    } else {
      console.error("❌ Bcrypt compatibility verification failed!");
      process.exit(1);
    }
  } catch (error) {
    console.error("Error during bcrypt compatibility test:", error);
    process.exit(1);
  }
}

testCompat();
