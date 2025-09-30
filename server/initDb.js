require('dotenv').config();
const { sequelize, User, CastingCall } = require('./models');
const bcrypt = require('bcryptjs');

async function initDatabase() {
  try {
    // Connect and sync database
    await sequelize.authenticate();
    console.log('Database connection established.');
    
    // Create tables
    await sequelize.sync({ force: true }); // Warning: This drops existing tables!
    console.log('Database tables created.');
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      email: 'admin@castingcompanion.com',
      password: hashedPassword,
      fullName: 'Admin User',
      isAdmin: true
    });
    console.log('Admin user created.');
    
    // Create demo casting calls
    const demoData = generateDemoCastingCalls();
    await CastingCall.bulkCreate(demoData);
    console.log('Demo casting calls created.');
    
    console.log('Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

function generateDemoCastingCalls() {
  const roleTypes = ['Lead', 'Supporting', 'Background', 'Extra', 'Commercial', 'Voiceover', 'Theater', 'Student Film'];
  const genders = ['Male', 'Female', 'Non-Binary', 'Any'];
  const ethnicities = ['Any', 'Caucasian', 'African American', 'Hispanic/Latino', 'Asian', 'Middle Eastern', 'Mixed'];
  const locations = ['Atlanta, GA', 'Los Angeles, CA', 'New York, NY', 'Chicago, IL', 'Miami, FL', 'Austin, TX', 'Nashville, TN'];
  const unions = ['Non-Union', 'SAG-AFTRA', 'Either'];
  
  const sampleImages = [
    'https://picsum.photos/seed/film1/400/300',
    'https://picsum.photos/seed/film2/400/300',
    'https://picsum.photos/seed/film3/400/300',
    'https://picsum.photos/seed/film4/400/300',
    'https://picsum.photos/seed/film5/400/300',
    null,
    'https://picsum.photos/seed/film6/400/300',
    null,
    'https://picsum.photos/seed/film7/400/300',
  ];
  
  const calls = [];
  for (let i = 1; i <= 30; i++) {
    calls.push({
      title: `${roleTypes[Math.floor(Math.random() * roleTypes.length)]} Role - ${['Feature Film', 'TV Series', 'Commercial', 'Web Series', 'Short Film'][Math.floor(Math.random() * 5)]}`,
      production: `Production ${i}`,
      roleType: roleTypes[Math.floor(Math.random() * roleTypes.length)],
      description: `Seeking talented actor for exciting ${roleTypes[Math.floor(Math.random() * roleTypes.length)].toLowerCase()} role in upcoming production.`,
      gender: genders[Math.floor(Math.random() * genders.length)],
      ageRange: `${18 + Math.floor(Math.random() * 20)}-${30 + Math.floor(Math.random() * 20)}`,
      ethnicity: ethnicities[Math.floor(Math.random() * ethnicities.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      compensation: Math.random() > 0.5 ? `$${(Math.random() * 500 + 100).toFixed(0)}/day` : 'Copy, Credit, Meals',
      shootDates: `${Math.floor(Math.random() * 28) + 1}/10/2025 - ${Math.floor(Math.random() * 28) + 1}/11/2025`,
      unionStatus: unions[Math.floor(Math.random() * unions.length)],
      skills: ['Acting Experience', 'On Camera Experience', Math.random() > 0.5 ? 'Dance' : 'Sports'].filter(() => Math.random() > 0.3),
      castingDirector: `director${i}@casting.com`,
      deadline: `10/${Math.floor(Math.random() * 28) + 1}/2025`,
      featuredImage: sampleImages[Math.floor(Math.random() * sampleImages.length)]
    });
  }
  return calls;
}

initDatabase();