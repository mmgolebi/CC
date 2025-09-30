import React, { useState, useEffect } from 'react';
import { Camera, Upload, Mail, Phone, MapPin, DollarSign, Calendar, CheckCircle, XCircle, Film, Users, TrendingUp, Clock, Search, Filter, Plus, Edit, Trash2, Eye, Send, Download, User, Settings, LogOut, Bell, Star, Award, Target } from 'lucide-react';

// Stripe configuration
const STRIPE_PUBLISHABLE_KEY = 'pk_live_51NoA8vGnKgBlu0simabVtwPZLWncg0i7S1hs09rmn63W1Z1xWtdLHh13D8rXMUlN0gzUP617KfzdJCiElQ8QkyeL00cwcfJpWB';

// Load Stripe script
const loadStripeScript = () => {
  return new Promise((resolve) => {
    if (window.Stripe) {
      resolve(window.Stripe(STRIPE_PUBLISHABLE_KEY));
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.onload = () => {
      resolve(window.Stripe(STRIPE_PUBLISHABLE_KEY));
    };
    document.body.appendChild(script);
  });
};

// Mock data for demo casting calls
const generateDemoCastingCalls = () => {
  const roleTypes = ['Lead', 'Supporting', 'Background', 'Extra', 'Commercial', 'Voiceover', 'Theater', 'Student Film'];
  const genders = ['Male', 'Female', 'Non-Binary', 'Any'];
  const ethnicities = ['Any', 'Caucasian', 'African American', 'Hispanic/Latino', 'Asian', 'Middle Eastern', 'Mixed'];
  const locations = ['Atlanta, GA', 'Los Angeles, CA', 'New York, NY', 'Chicago, IL', 'Miami, FL', 'Austin, TX', 'Nashville, TN'];
  const unions = ['Non-Union', 'SAG-AFTRA', 'Either'];
  
  // Sample featured images (using reliable placeholder service)
  const sampleImages = [
    'https://picsum.photos/seed/film1/400/300',
    'https://picsum.photos/seed/film2/400/300',
    'https://picsum.photos/seed/film3/400/300',
    'https://picsum.photos/seed/film4/400/300',
    'https://picsum.photos/seed/film5/400/300',
    null, // Some casting calls won't have images
    'https://picsum.photos/seed/film6/400/300',
    null,
    'https://picsum.photos/seed/film7/400/300',
    'https://picsum.photos/seed/film8/400/300',
    'https://picsum.photos/seed/film9/400/300',
  ];
  
  const calls = [];
  for (let i = 1; i <= 30; i++) {
    calls.push({
      id: i,
      title: `${roleTypes[Math.floor(Math.random() * roleTypes.length)]} Role - ${['Feature Film', 'TV Series', 'Commercial', 'Web Series', 'Short Film'][Math.floor(Math.random() * 5)]}`,
      production: `Production ${i}`,
      roleType: roleTypes[Math.floor(Math.random() * roleTypes.length)],
      description: `Seeking talented actor for exciting ${roleTypes[Math.floor(Math.random() * roleTypes.length)].toLowerCase()} role in upcoming production.`,
      gender: genders[Math.floor(Math.random() * genders.length)],
      ageRange: `${18 + Math.floor(Math.random() * 20)}-${30 + Math.floor(Math.random() * 20)}`,
      ethnicity: ethnicities[Math.floor(Math.random() * ethnicities.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      compensation: Math.random() > 0.5 ? `${(Math.random() * 500 + 100).toFixed(0)}/day` : 'Copy, Credit, Meals',
      shootDates: `${Math.floor(Math.random() * 28) + 1}/10/2025 - ${Math.floor(Math.random() * 28) + 1}/11/2025`,
      unionStatus: unions[Math.floor(Math.random() * unions.length)],
      skills: ['Acting Experience', 'On Camera Experience', Math.random() > 0.5 ? 'Dance' : 'Sports'].filter(() => Math.random() > 0.3),
      castingDirector: `director${i}@casting.com`,
      deadline: `10/${Math.floor(Math.random() * 28) + 1}/2025`,
      created: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      featuredImage: sampleImages[Math.floor(Math.random() * sampleImages.length)]
    });
  }
  return calls;
};

const CastingCompanionApp = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Auth states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  
  // Onboarding states
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    zip: '',
    willingToTravel: false,
    travelDistance: '',
    actualAge: '',
    playableAgeMin: '',
    playableAgeMax: '',
    gender: '',
    ethnicity: '',
    unionStatus: '',
    headshot: null,
    fullBodyShot: null,
    resume: null,
    reelLink: '',
    roleTypes: [],
    specialSkills: [],
    comfortableWith: [],
    availability: '',
    hasTransport: false,
    compensation: [],
    languages: [],
    socialMedia: { instagram: '', tiktok: '', youtube: '' },
    agency: '',
    height: '',
    weight: '',
    hairColor: '',
    eyeColor: '',
    visibleTattoos: false
  });
  
  // Casting calls and submissions
  const [castingCalls, setCastingCalls] = useState(generateDemoCastingCalls());
  const [submissions, setSubmissions] = useState([]);
  const [matches, setMatches] = useState([]);
  const [currentCallPage, setCurrentCallPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  
  // Admin states
  const [newCastingCall, setNewCastingCall] = useState({
    title: '', production: '', roleType: '', description: '', gender: '',
    ageRange: '', ethnicity: '', location: '', compensation: '', shootDates: '',
    unionStatus: '', skills: [], castingDirector: '', deadline: '', featuredImage: ''
  });
  const [editingCall, setEditingCall] = useState(null);
  const [stripeLoading, setStripeLoading] = useState(false);

  useEffect(() => {
    // Check for successful payment return
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment_success') === 'true') {
      alert('Payment successful! Welcome to CastingCompanion!');
      setCurrentPage('dashboard');
    } else if (urlParams.get('payment_cancelled') === 'true') {
      alert('Payment was cancelled. You can try again when ready.');
      setCurrentPage('payment');
    }
  }, []);

  useEffect(() => {
    if (currentUser && currentPage === 'dashboard') {
      calculateMatches();
    }
  }, [currentUser, castingCalls]);

  const calculateMatchScore = (call, user) => {
    let score = 0;
    
    // Age match (30 points)
    const userAge = parseInt(user.actualAge);
    const ageMin = parseInt(call.ageRange.split('-')[0]);
    const ageMax = parseInt(call.ageRange.split('-')[1]);
    if (userAge >= ageMin && userAge <= ageMax) {
      score += 30;
    }
    
    // Gender match (25 points)
    if (call.gender === 'Any' || call.gender === user.gender) {
      score += 25;
    }
    
    // Ethnicity match (15 points)
    if (call.ethnicity === 'Any' || call.ethnicity === user.ethnicity) {
      score += 15;
    }
    
    // Union status match (20 points)
    if (call.unionStatus === 'Either' || call.unionStatus === user.unionStatus) {
      score += 20;
    }
    
    // Role type interest match (10 points)
    if (user.roleTypes && user.roleTypes.includes(call.roleType)) {
      score += 10;
    }
    
    return score;
  };

  const calculateMatches = () => {
    if (!currentUser) return;
    
    const matched = castingCalls.filter(call => {
      const ageMatch = parseInt(currentUser.actualAge) >= parseInt(call.ageRange.split('-')[0]) && 
                       parseInt(currentUser.actualAge) <= parseInt(call.ageRange.split('-')[1]);
      const genderMatch = call.gender === 'Any' || call.gender === currentUser.gender;
      const ethnicityMatch = call.ethnicity === 'Any' || call.ethnicity === currentUser.ethnicity;
      const unionMatch = call.unionStatus === 'Either' || call.unionStatus === currentUser.unionStatus;
      
      return ageMatch && genderMatch && ethnicityMatch && unionMatch;
    });
    
    setMatches(matched);
    
    // Auto-submit to high-quality matches (score >= 85)
    const newAutoSubmissions = [];
    matched.forEach(call => {
      const score = calculateMatchScore(call, currentUser);
      const alreadySubmitted = submissions.some(s => s.callId === call.id);
      
      if (score >= 85 && !alreadySubmitted) {
        const autoSubmission = {
          id: Date.now() + call.id,
          callId: call.id,
          callTitle: call.title,
          castingDirector: call.castingDirector,
          submittedAt: new Date().toISOString(),
          status: 'Auto-Submitted',
          matchScore: score
        };
        newAutoSubmissions.push(autoSubmission);
      }
    });
    
    if (newAutoSubmissions.length > 0) {
      setSubmissions(prev => [...newAutoSubmissions, ...prev]);
    }
  };

  const handleLogin = () => {
    if (loginEmail === 'admin@castingcompanion.com') {
      setIsAdmin(true);
      setCurrentUser({ email: loginEmail, fullName: 'Admin User' });
      setCurrentPage('admin');
    } else {
      setCurrentUser({ email: loginEmail, fullName: 'Demo User', actualAge: '25', gender: 'Female', ethnicity: 'Any', unionStatus: 'Non-Union' });
      setCurrentPage('dashboard');
    }
  };

  const handleSignup = () => {
    setProfileData({ ...profileData, email: signupEmail });
    setCurrentPage('onboarding');
  };

  const handleForgotPassword = () => {
    alert(`Password reset email sent to ${forgotEmail}`);
    setCurrentPage('login');
  };

  const handleOnboardingNext = () => {
    if (onboardingStep < 4) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      // Merge profile data with signup email
      const completeProfile = {
        ...profileData,
        email: signupEmail || profileData.email
      };
      setCurrentUser(completeProfile);
      setCurrentPage('payment');
    }
  };

  const handlePayment = async () => {
    setStripeLoading(true);
    
    try {
      // Note: In production, you'll need a backend endpoint to create Checkout Sessions
      // For now, we'll redirect to a Stripe Payment Link (you'll need to create this in Stripe Dashboard)
      
      // TEMPORARY: Show instructions for creating Stripe Payment Link
      const createPaymentLink = window.confirm(
        "To complete Stripe integration, you need to:\n\n" +
        "1. Go to Stripe Dashboard → Payment Links\n" +
        "2. Create a new Payment Link with:\n" +
        "   - $1 trial for 14 days\n" +
        "   - Then $39.97/month subscription\n" +
        "3. Set Success URL to: http://localhost:3000?payment_success=true\n" +
        "4. Set Cancel URL to: http://localhost:3000?payment_cancelled=true\n\n" +
        "For demo purposes, would you like to skip to the dashboard?"
      );
      
      if (createPaymentLink) {
        // Demo mode - skip to dashboard
        alert('Payment successful! Welcome email sent.');
        setCurrentPage('dashboard');
      }
      
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setStripeLoading(false);
    }
  };

  const handleSubmitToCall = (call) => {
    const newSubmission = {
      id: Date.now(),
      callId: call.id,
      callTitle: call.title,
      castingDirector: call.castingDirector,
      submittedAt: new Date().toISOString(),
      status: 'Manually Submitted',
      matchScore: calculateMatchScore(call, currentUser)
    };
    setSubmissions([newSubmission, ...submissions]);
    alert(`Successfully submitted to: ${call.title}\nEmail sent to ${call.castingDirector}`);
  };

  const handleAddCastingCall = () => {
    if (!newCastingCall.title || !newCastingCall.production) {
      alert('Please fill in all required fields');
      return;
    }
    const call = { ...newCastingCall, id: castingCalls.length + 1, created: new Date().toISOString() };
    setCastingCalls([call, ...castingCalls]);
    setNewCastingCall({
      title: '', production: '', roleType: '', description: '', gender: '',
      ageRange: '', ethnicity: '', location: '', compensation: '', shootDates: '',
      unionStatus: '', skills: [], castingDirector: '', deadline: '', featuredImage: ''
    });
    alert('Casting call added successfully!');
  };

  const handleDeleteCall = (id) => {
    if (window.confirm('Delete this casting call?')) {
      setCastingCalls(castingCalls.filter(c => c.id !== id));
    }
  };

  const filteredCalls = castingCalls.filter(call => {
    const matchesSearch = call.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         call.production.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRole === 'all' || call.roleType === filterRole;
    return matchesSearch && matchesFilter;
  });

  const paginatedCalls = filteredCalls.slice((currentCallPage - 1) * 10, currentCallPage * 10);
  const totalPages = Math.ceil(filteredCalls.length / 10);

  // LOGIN PAGE
  if (currentPage === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <Film className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">CastingCompanion</h1>
            <p className="text-gray-600 mt-2">Your path to the spotlight</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="actor@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
            
            <button
              onClick={handleLogin}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              Sign In
            </button>
          </div>
          
          <div className="mt-6 text-center space-y-2">
            <button
              onClick={() => setCurrentPage('forgot')}
              className="text-purple-600 hover:text-purple-800 text-sm"
            >
              Forgot password?
            </button>
            <div className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <button
                onClick={() => setCurrentPage('signup')}
                className="text-purple-600 hover:text-purple-800 font-semibold"
              >
                Sign up
              </button>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-xs text-gray-600">
            <strong>Demo Accounts:</strong><br />
            Actor: any email + password<br />
            Admin: admin@castingcompanion.com + any password
          </div>
        </div>
      </div>
    );
  }

  // SIGNUP PAGE
  if (currentPage === 'signup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Account</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <button
              onClick={handleSignup}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              Continue to Profile Setup
            </button>
          </div>
          
          <div className="mt-4 text-center">
            <button
              onClick={() => setCurrentPage('login')}
              className="text-purple-600 hover:text-purple-800 text-sm"
            >
              Back to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // FORGOT PASSWORD PAGE
  if (currentPage === 'forgot') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Reset Password</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <button
              onClick={handleForgotPassword}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              Send Reset Link
            </button>
          </div>
          
          <div className="mt-4 text-center">
            <button
              onClick={() => setCurrentPage('login')}
              className="text-purple-600 hover:text-purple-800 text-sm"
            >
              Back to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ONBOARDING PAGE
  if (currentPage === 'onboarding') {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Complete Your Profile</h2>
              <span className="text-sm text-gray-600">Step {onboardingStep} of 4</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${(onboardingStep / 4) * 100}%` }}
              />
            </div>
          </div>

          {onboardingStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <input
                    type="text"
                    value={profileData.city}
                    onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                  <input
                    type="text"
                    value={profileData.state}
                    onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code *</label>
                  <input
                    type="text"
                    value={profileData.zip}
                    onChange={(e) => setProfileData({ ...profileData, zip: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Actual Age *</label>
                  <input
                    type="number"
                    value={profileData.actualAge}
                    onChange={(e) => setProfileData({ ...profileData, actualAge: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Playable Age Min *</label>
                  <input
                    type="number"
                    value={profileData.playableAgeMin}
                    onChange={(e) => setProfileData({ ...profileData, playableAgeMin: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Playable Age Max *</label>
                  <input
                    type="number"
                    value={profileData.playableAgeMax}
                    onChange={(e) => setProfileData({ ...profileData, playableAgeMax: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender Identity *</label>
                  <select
                    value={profileData.gender}
                    onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-Binary">Non-Binary</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ethnicity</label>
                  <select
                    value={profileData.ethnicity}
                    onChange={(e) => setProfileData({ ...profileData, ethnicity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select...</option>
                    <option value="Caucasian">Caucasian</option>
                    <option value="African American">African American</option>
                    <option value="Hispanic/Latino">Hispanic/Latino</option>
                    <option value="Asian">Asian</option>
                    <option value="Middle Eastern">Middle Eastern</option>
                    <option value="Mixed">Mixed</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Union Status *</label>
                <select
                  value={profileData.unionStatus}
                  onChange={(e) => setProfileData({ ...profileData, unionStatus: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select...</option>
                  <option value="SAG-AFTRA">SAG-AFTRA</option>
                  <option value="Non-Union">Non-Union</option>
                  <option value="Either">Either</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={profileData.willingToTravel}
                  onChange={(e) => setProfileData({ ...profileData, willingToTravel: e.target.checked })}
                  className="w-4 h-4 text-purple-600"
                />
                <label className="text-sm text-gray-700">Willing to travel for roles</label>
              </div>
            </div>
          )}

          {onboardingStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Media & Portfolio</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Headshot *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Upload your primary headshot</p>
                  <input type="file" className="mt-2" accept="image/*" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Body Shot</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Upload full body photo</p>
                  <input type="file" className="mt-2" accept="image/*" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Resume (PDF/DOC)</label>
                <input type="file" className="w-full" accept=".pdf,.doc,.docx" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reel/Slate Video Link</label>
                <input
                  type="url"
                  value={profileData.reelLink}
                  onChange={(e) => setProfileData({ ...profileData, reelLink: e.target.value })}
                  placeholder="YouTube, Vimeo, or Google Drive link"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          )}

          {onboardingStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Role Preferences & Skills</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Role Types Interested In *</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Lead', 'Supporting', 'Background', 'Extra', 'Commercial', 'Theater', 'Voiceover', 'Student Film'].map(role => (
                    <label key={role} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={profileData.roleTypes.includes(role)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setProfileData({ ...profileData, roleTypes: [...profileData.roleTypes, role] });
                          } else {
                            setProfileData({ ...profileData, roleTypes: profileData.roleTypes.filter(r => r !== role) });
                          }
                        }}
                        className="w-4 h-4 text-purple-600"
                      />
                      <span className="text-sm text-gray-700">{role}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Special Skills</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Dance', 'Singing', 'Instruments', 'Sports', 'Martial Arts', 'Languages', 'Stunts', 'Stage Combat'].map(skill => (
                    <label key={skill} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={profileData.specialSkills.includes(skill)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setProfileData({ ...profileData, specialSkills: [...profileData.specialSkills, skill] });
                          } else {
                            setProfileData({ ...profileData, specialSkills: profileData.specialSkills.filter(s => s !== skill) });
                          }
                        }}
                        className="w-4 h-4 text-purple-600"
                      />
                      <span className="text-sm text-gray-700">{skill}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Comfortable With</label>
                <div className="space-y-2">
                  {['Stunts/Fight Scenes', 'On-Camera Intimacy/Kissing', 'Nudity'].map(item => (
                    <label key={item} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={profileData.comfortableWith.includes(item)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setProfileData({ ...profileData, comfortableWith: [...profileData.comfortableWith, item] });
                          } else {
                            setProfileData({ ...profileData, comfortableWith: profileData.comfortableWith.filter(i => i !== item) });
                          }
                        }}
                        className="w-4 h-4 text-purple-600"
                      />
                      <span className="text-sm text-gray-700">{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {onboardingStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Logistics & Additional Info</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                <select
                  value={profileData.availability}
                  onChange={(e) => setProfileData({ ...profileData, availability: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select...</option>
                  <option value="Full-time">Full-time Available</option>
                  <option value="Nights/Weekends">Nights & Weekends</option>
                  <option value="Flexible">Flexible Schedule</option>
                  <option value="Limited">Limited Availability</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={profileData.hasTransport}
                  onChange={(e) => setProfileData({ ...profileData, hasTransport: e.target.checked })}
                  className="w-4 h-4 text-purple-600"
                />
                <label className="text-sm text-gray-700">I have reliable transportation</label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Compensation Preferences</label>
                <div className="space-y-2">
                  {['Paid Only', 'Paid + Copy/Credit/Meals', 'Willing to do Unpaid/Student Projects'].map(comp => (
                    <label key={comp} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={profileData.compensation.includes(comp)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setProfileData({ ...profileData, compensation: [...profileData.compensation, comp] });
                          } else {
                            setProfileData({ ...profileData, compensation: profileData.compensation.filter(c => c !== comp) });
                          }
                        }}
                        className="w-4 h-4 text-purple-600"
                      />
                      <span className="text-sm text-gray-700">{comp}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
                  <input
                    type="text"
                    value={profileData.height}
                    onChange={(e) => setProfileData({ ...profileData, height: e.target.value })}
                    placeholder="5'8&quot;"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weight</label>
                  <input
                    type="text"
                    value={profileData.weight}
                    onChange={(e) => setProfileData({ ...profileData, weight: e.target.value })}
                    placeholder="150 lbs"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hair Color</label>
                  <input
                    type="text"
                    value={profileData.hairColor}
                    onChange={(e) => setProfileData({ ...profileData, hairColor: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Eye Color</label>
                  <input
                    type="text"
                    value={profileData.eyeColor}
                    onChange={(e) => setProfileData({ ...profileData, eyeColor: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-between">
            {onboardingStep > 1 && (
              <button
                onClick={() => setOnboardingStep(onboardingStep - 1)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
            )}
            <button
              onClick={handleOnboardingNext}
              className="ml-auto px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
            >
              {onboardingStep < 4 ? 'Continue' : 'Complete Profile'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PAYMENT PAGE
  if (currentPage === 'payment') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <DollarSign className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">Start Your Trial</h2>
            <p className="text-gray-600 mt-2">14-day trial for just $1</p>
          </div>

          <div className="bg-purple-50 rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-700">14-Day Trial</span>
              <span className="text-2xl font-bold text-purple-600">$1.00</span>
            </div>
            <div className="border-t border-purple-200 pt-4 text-sm text-gray-600">
              After trial: $39.97/month
              <br />
              Cancel anytime
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
              <input
                type="text"
                placeholder="4242 4242 4242 4242"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expiry</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CVC</label>
                <input
                  type="text"
                  placeholder="123"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={stripeLoading}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {stripeLoading ? 'Processing...' : 'Start My Trial'}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    );
  }

  // ACTOR DASHBOARD
  if (currentPage === 'dashboard') {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Film className="w-8 h-8 text-purple-600" />
              <span className="text-xl font-bold text-gray-900">CastingCompanion</span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900">
                <Bell className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentPage('profile')}
                className="text-gray-600 hover:text-gray-900"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setCurrentUser(null);
                  setCurrentPage('login');
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {currentUser?.fullName || 'Actor'}!</h1>
            <p className="text-gray-600 mt-1">Here's your casting activity</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Matches</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">{matches.length}</p>
                </div>
                <Target className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Submissions</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">{submissions.length}</p>
                </div>
                <Send className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Auto-Submitted</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">
                    {submissions.filter(s => s.status === 'Auto-Submitted').length}
                  </p>
                </div>
                <Star className="w-12 h-12 text-green-600 opacity-20" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Matches</h2>
            
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search casting calls..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Roles</option>
                <option value="Lead">Lead</option>
                <option value="Supporting">Supporting</option>
                <option value="Background">Background</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>

            <div className="space-y-4">
              {paginatedCalls.map(call => {
                const matchScore = calculateMatchScore(call, currentUser);
                const isHighMatch = matchScore >= 85;
                const alreadySubmitted = submissions.some(s => s.callId === call.id);
                
                return (
                  <div key={call.id} className="border border-gray-200 rounded-lg overflow-hidden hover:border-purple-500 transition">
                    {call.featuredImage && (
                      <div className="w-full h-48 bg-gray-200 relative">
                        <img 
                          src={call.featuredImage} 
                          alt={call.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100"><svg class="w-16 h-16 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"></path></svg></div>';
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900">{call.title}</h3>
                            {isHighMatch && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                                <Star className="w-3 h-3" fill="currentColor" />
                                {matchScore}% Match
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{call.production}</p>
                        </div>
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                          {call.roleType}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                        <div>
                          <span className="text-gray-600">Location:</span>
                          <p className="font-medium text-gray-900">{call.location}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Age Range:</span>
                          <p className="font-medium text-gray-900">{call.ageRange}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Compensation:</span>
                          <p className="font-medium text-gray-900">{call.compensation}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Deadline:</span>
                          <p className="font-medium text-gray-900">{call.deadline}</p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 mb-4">{call.description}</p>

                      <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                          {call.skills.slice(0, 3).map(skill => (
                            <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                        <button
                          onClick={() => handleSubmitToCall(call)}
                          disabled={alreadySubmitted}
                          className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                            alreadySubmitted
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-purple-600 text-white hover:bg-purple-700'
                          }`}
                        >
                          {alreadySubmitted ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Submitted
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              Submit
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentCallPage(Math.max(1, currentCallPage - 1))}
                  disabled={currentCallPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentCallPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentCallPage(Math.min(totalPages, currentCallPage + 1))}
                  disabled={currentCallPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {submissions.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Submissions</h2>
              <div className="space-y-3">
                {submissions.slice(0, 10).map(sub => (
                  <div key={sub.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{sub.callTitle}</p>
                        {sub.matchScore && (
                          <span className="text-xs text-gray-500">
                            {sub.matchScore}% match
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        Submitted to {sub.castingDirector} • {new Date(sub.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      sub.status === 'Auto-Submitted' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {sub.status}
                    </span>
                  </div>
                ))}
              </div>
              
              {submissions.filter(s => s.status === 'Auto-Submitted').length > 0 && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Star className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" />
                    <div>
                      <p className="text-sm font-medium text-green-900">
                        Auto-Submission Active
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        We automatically submit you to roles with 85%+ match score to maximize your opportunities!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // PROFILE/SETTINGS PAGE
  if (currentPage === 'profile') {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Film className="w-8 h-8 text-purple-600" />
              <span className="text-xl font-bold text-gray-900">CastingCompanion</span>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setCurrentPage('dashboard')}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => {
                  setCurrentUser(null);
                  setCurrentPage('login');
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600 mt-1">Manage your actor profile and preferences</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={currentUser.fullName || profileData.fullName}
                  onChange={(e) => setCurrentUser({ ...currentUser, fullName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={currentUser.email || profileData.email}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={currentUser.phone || profileData.phone}
                  onChange={(e) => setCurrentUser({ ...currentUser, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={`${currentUser.city || profileData.city}, ${currentUser.state || profileData.state}`}
                  onChange={(e) => {
                    const [city, state] = e.target.value.split(',');
                    setCurrentUser({ ...currentUser, city: city?.trim(), state: state?.trim() });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="City, State"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Actual Age</label>
                <input
                  type="number"
                  value={currentUser.actualAge || profileData.actualAge}
                  onChange={(e) => setCurrentUser({ ...currentUser, actualAge: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Playable Age Range</label>
                <input
                  type="text"
                  value={`${currentUser.playableAgeMin || profileData.playableAgeMin}-${currentUser.playableAgeMax || profileData.playableAgeMax}`}
                  onChange={(e) => {
                    const [min, max] = e.target.value.split('-');
                    setCurrentUser({ ...currentUser, playableAgeMin: min, playableAgeMax: max });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="18-25"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender Identity</label>
                <select
                  value={currentUser.gender || profileData.gender}
                  onChange={(e) => setCurrentUser({ ...currentUser, gender: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-Binary">Non-Binary</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ethnicity</label>
                <select
                  value={currentUser.ethnicity || profileData.ethnicity}
                  onChange={(e) => setCurrentUser({ ...currentUser, ethnicity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Prefer not to say</option>
                  <option value="Caucasian">Caucasian</option>
                  <option value="African American">African American</option>
                  <option value="Hispanic/Latino">Hispanic/Latino</option>
                  <option value="Asian">Asian</option>
                  <option value="Middle Eastern">Middle Eastern</option>
                  <option value="Mixed">Mixed</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Union Status</label>
                <select
                  value={currentUser.unionStatus || profileData.unionStatus}
                  onChange={(e) => setCurrentUser({ ...currentUser, unionStatus: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="SAG-AFTRA">SAG-AFTRA</option>
                  <option value="Non-Union">Non-Union</option>
                  <option value="Either">Either</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
                <input
                  type="text"
                  value={currentUser.height || profileData.height}
                  onChange={(e) => setCurrentUser({ ...currentUser, height: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="5'8&quot;"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight</label>
                <input
                  type="text"
                  value={currentUser.weight || profileData.weight}
                  onChange={(e) => setCurrentUser({ ...currentUser, weight: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="150 lbs"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hair Color</label>
                <input
                  type="text"
                  value={currentUser.hairColor || profileData.hairColor}
                  onChange={(e) => setCurrentUser({ ...currentUser, hairColor: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Eye Color</label>
                <input
                  type="text"
                  value={currentUser.eyeColor || profileData.eyeColor}
                  onChange={(e) => setCurrentUser({ ...currentUser, eyeColor: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Role Preferences</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Role Types Interested In</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['Lead', 'Supporting', 'Background', 'Extra', 'Commercial', 'Theater', 'Voiceover', 'Student Film'].map(role => (
                  <label key={role} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={(currentUser.roleTypes || profileData.roleTypes || []).includes(role)}
                      onChange={(e) => {
                        const currentRoles = currentUser.roleTypes || profileData.roleTypes || [];
                        if (e.target.checked) {
                          setCurrentUser({ ...currentUser, roleTypes: [...currentRoles, role] });
                        } else {
                          setCurrentUser({ ...currentUser, roleTypes: currentRoles.filter(r => r !== role) });
                        }
                      }}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span className="text-sm text-gray-700">{role}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Special Skills</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['Dance', 'Singing', 'Instruments', 'Sports', 'Martial Arts', 'Languages', 'Stunts', 'Stage Combat'].map(skill => (
                  <label key={skill} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={(currentUser.specialSkills || profileData.specialSkills || []).includes(skill)}
                      onChange={(e) => {
                        const currentSkills = currentUser.specialSkills || profileData.specialSkills || [];
                        if (e.target.checked) {
                          setCurrentUser({ ...currentUser, specialSkills: [...currentSkills, skill] });
                        } else {
                          setCurrentUser({ ...currentUser, specialSkills: currentSkills.filter(s => s !== skill) });
                        }
                      }}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span className="text-sm text-gray-700">{skill}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Media & Links</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reel/Slate Video Link</label>
                <input
                  type="url"
                  value={currentUser.reelLink || profileData.reelLink}
                  onChange={(e) => setCurrentUser({ ...currentUser, reelLink: e.target.value })}
                  placeholder="YouTube, Vimeo, or Google Drive link"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Agency Representation</label>
                <input
                  type="text"
                  value={currentUser.agency || profileData.agency}
                  onChange={(e) => setCurrentUser({ ...currentUser, agency: e.target.value })}
                  placeholder="Agency name (if any)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                  <input
                    type="text"
                    value={currentUser.socialMedia?.instagram || profileData.socialMedia?.instagram || ''}
                    onChange={(e) => setCurrentUser({ 
                      ...currentUser, 
                      socialMedia: { ...(currentUser.socialMedia || {}), instagram: e.target.value }
                    })}
                    placeholder="@username"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">TikTok</label>
                  <input
                    type="text"
                    value={currentUser.socialMedia?.tiktok || profileData.socialMedia?.tiktok || ''}
                    onChange={(e) => setCurrentUser({ 
                      ...currentUser, 
                      socialMedia: { ...(currentUser.socialMedia || {}), tiktok: e.target.value }
                    })}
                    placeholder="@username"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">YouTube</label>
                  <input
                    type="text"
                    value={currentUser.socialMedia?.youtube || profileData.socialMedia?.youtube || ''}
                    onChange={(e) => setCurrentUser({ 
                      ...currentUser, 
                      socialMedia: { ...(currentUser.socialMedia || {}), youtube: e.target.value }
                    })}
                    placeholder="Channel URL"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Subscription</h2>
            
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Pro Plan</p>
                <p className="text-sm text-gray-600">$39.97/month • Next billing: Oct 15, 2025</p>
              </div>
              <button className="px-4 py-2 text-sm text-purple-600 hover:text-purple-800 font-medium">
                Manage Subscription
              </button>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => {
                alert('Profile updated successfully!');
                calculateMatches();
                setCurrentPage('dashboard');
              }}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
            >
              Save Changes
            </button>
            
            <button
              onClick={() => setCurrentPage('dashboard')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ADMIN DASHBOARD
  if (currentPage === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Film className="w-8 h-8 text-purple-600" />
              <span className="text-xl font-bold text-gray-900">CastingCompanion Admin</span>
            </div>
            <button
              onClick={() => {
                setCurrentUser(null);
                setIsAdmin(false);
                setCurrentPage('login');
              }}
              className="text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Casting Calls</h1>

          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Casting Call</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={newCastingCall.title}
                    onChange={(e) => setNewCastingCall({ ...newCastingCall, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Production *</label>
                  <input
                    type="text"
                    value={newCastingCall.production}
                    onChange={(e) => setNewCastingCall({ ...newCastingCall, production: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={newCastingCall.description}
                  onChange={(e) => setNewCastingCall({ ...newCastingCall, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role Type *</label>
                  <select
                    value={newCastingCall.roleType}
                    onChange={(e) => setNewCastingCall({ ...newCastingCall, roleType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select...</option>
                    <option value="Lead">Lead</option>
                    <option value="Supporting">Supporting</option>
                    <option value="Background">Background</option>
                    <option value="Extra">Extra</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                  <select
                    value={newCastingCall.gender}
                    onChange={(e) => setNewCastingCall({ ...newCastingCall, gender: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-Binary">Non-Binary</option>
                    <option value="Any">Any</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age Range *</label>
                  <input
                    type="text"
                    value={newCastingCall.ageRange}
                    onChange={(e) => setNewCastingCall({ ...newCastingCall, ageRange: e.target.value })}
                    placeholder="18-25"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                  <input
                    type="text"
                    value={newCastingCall.location}
                    onChange={(e) => setNewCastingCall({ ...newCastingCall, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Compensation *</label>
                  <input
                    type="text"
                    value={newCastingCall.compensation}
                    onChange={(e) => setNewCastingCall({ ...newCastingCall, compensation: e.target.value })}
                    placeholder="$200/day or Copy, Credit, Meals"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Union Status *</label>
                  <select
                    value={newCastingCall.unionStatus}
                    onChange={(e) => setNewCastingCall({ ...newCastingCall, unionStatus: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select...</option>
                    <option value="SAG-AFTRA">SAG-AFTRA</option>
                    <option value="Non-Union">Non-Union</option>
                    <option value="Either">Either</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Casting Director Email *</label>
                  <input
                    type="email"
                    value={newCastingCall.castingDirector}
                    onChange={(e) => setNewCastingCall({ ...newCastingCall, castingDirector: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deadline *</label>
                  <input
                    type="text"
                    value={newCastingCall.deadline}
                    onChange={(e) => setNewCastingCall({ ...newCastingCall, deadline: e.target.value })}
                    placeholder="MM/DD/YYYY"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <button
                onClick={handleAddCastingCall}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Casting Call
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">All Casting Calls ({castingCalls.length})</h2>
            
            <div className="space-y-3">
              {castingCalls.slice(0, 10).map(call => (
                <div key={call.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-purple-500 transition">
                  <div className="flex items-center gap-4 flex-1">
                    {call.featuredImage && (
                      <div className="w-20 h-20 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden">
                        <img 
                          src={call.featuredImage} 
                          alt={call.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100"><svg class="w-8 h-8 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{call.title}</h3>
                      <p className="text-sm text-gray-600">{call.production} • {call.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-600 hover:text-blue-600">
                      <Eye className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-purple-600">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCall(call.id)}
                      className="p-2 text-gray-600 hover:text-red-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default CastingCompanionApp;