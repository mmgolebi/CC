const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  logging: false,
  dialect: 'postgres'
});

// User Model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fullName: DataTypes.STRING,
  phone: DataTypes.STRING,
  city: DataTypes.STRING,
  state: DataTypes.STRING,
  zip: DataTypes.STRING,
  actualAge: DataTypes.INTEGER,
  playableAgeMin: DataTypes.INTEGER,
  playableAgeMax: DataTypes.INTEGER,
  gender: DataTypes.STRING,
  ethnicity: DataTypes.STRING,
  unionStatus: DataTypes.STRING,
  reelLink: DataTypes.STRING,
  roleTypes: DataTypes.JSON,
  specialSkills: DataTypes.JSON,
  comfortableWith: DataTypes.JSON,
  availability: DataTypes.STRING,
  hasTransport: DataTypes.BOOLEAN,
  compensation: DataTypes.JSON,
  height: DataTypes.STRING,
  weight: DataTypes.STRING,
  hairColor: DataTypes.STRING,
  eyeColor: DataTypes.STRING,
  agency: DataTypes.STRING,
  socialMedia: DataTypes.JSON,
  stripeCustomerId: DataTypes.STRING,
  subscriptionStatus: DataTypes.STRING,
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

// Casting Call Model
const CastingCall = sequelize.define('CastingCall', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  production: DataTypes.STRING,
  roleType: DataTypes.STRING,
  description: DataTypes.TEXT,
  gender: DataTypes.STRING,
  ageRange: DataTypes.STRING,
  ethnicity: DataTypes.STRING,
  location: DataTypes.STRING,
  compensation: DataTypes.STRING,
  shootDates: DataTypes.STRING,
  unionStatus: DataTypes.STRING,
  skills: DataTypes.JSON,
  castingDirector: DataTypes.STRING,
  deadline: DataTypes.STRING,
  featuredImage: DataTypes.STRING
});

// Submission Model
const Submission = sequelize.define('Submission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Submitted'
  },
  matchScore: DataTypes.INTEGER
});

// Relationships
User.hasMany(Submission);
Submission.belongsTo(User);
CastingCall.hasMany(Submission);
Submission.belongsTo(CastingCall);

module.exports = { sequelize, User, CastingCall, Submission };