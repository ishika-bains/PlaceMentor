import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from './config/db.js';
import { QuestionRepository } from './models/index.js';
import { seedQuestions } from './data/seedQuestions.js';

export const runSeed = async () => {
  try {
    await connectDB();
    const count = await QuestionRepository.count();
    console.log(`[Seed] Current question count: ${count}`);

    if (count === 0) {
      console.log(`[Seed] Seeding ${seedQuestions.length} comprehensive placement questions...`);
      await QuestionRepository.createMany(seedQuestions);
      console.log(`[Seed] Successfully seeded questions!`);
    } else {
      console.log(`[Seed] Database already contains ${count} questions. Skipping seed.`);
    }
  } catch (err) {
    console.error('[Seed Error]:', err.message);
  }
};

// If run directly via node src/seed.js
if (process.argv[1]?.includes('seed.js')) {
  runSeed().then(() => {
    console.log('[Seed] Finished execution.');
    process.exit(0);
  });
}
