// One-time import of the current hardcoded Team + Events content into MongoDB.
// Usage:  node src/seed.js        (needs MONGODB_URI in backend/.env)
// Safe to re-run: matches by name/title and updates instead of duplicating.
require('dotenv').config();
const mongoose = require('mongoose');
const TeamMember = require('./models/TeamMember');
const Event = require('./models/Event');

const TEAM = [
  ['Rishi Kumar Mishra', 'President', 'Presidents', '3rd Year', 'N/A', 'Overseeing strategic vision, incubation partnerships, and ecosystem development for SEBC.'],
  ['Atul Sahane', 'Vice President', 'Presidents', '3rd Year', 'N/A', 'Managing cross-departmental operations, pitch programs, and founder support workflows.'],
  ['Saurav Jha', 'Secretary', 'Secretaries', '3rd Year', 'N/A', 'Directing institutional compliance, official correspondence, and administrative records.'],
  ['Shaik Maksud Ahmad', 'Secretary', 'Secretaries', '3rd Year', 'N/A', 'Coordinating inter-team communication, student outreach, and operational tracking.'],
  ['Jahan Ara Khan', 'Treasurer', 'Treasurers', '3rd Year', 'N/A', 'Managing financial allocation, event budgeting, and incubation grant tracking.'],
  ['M.D. Praveen', 'Technical Team Head', 'Technical', '3rd Year', 'N/A', 'Architecting web platforms, student portals, and digital acceleration infrastructure.'],
  ['Ashirwad Deshmukh', 'Technical Team Co-Head', 'Technical', '3rd Year', 'N/A', 'Co-leading technical platform updates, backend integrations, and platform maintenance.'],
  ['Jayesh Ranjit Patil', 'Technical Team Co-Head', 'Technical', '3rd Year', 'N/A', 'Building frontend user interfaces, responsive design components, and web workflows.'],
  ['Darshana Kushwaha', 'Event Team Head', 'Event & Marketing', '3rd Year', 'N/A', 'Designing pitch competitions, workshop schedules, and campus venue executions.'],
  ['Manish Patil', 'Event Team Co-Head', 'Event & Marketing', '3rd Year', 'N/A', 'Coordinating event logistics, judge hospitality, and stage management.'],
  ['Komal Pimple', 'Event Team Member', 'Event & Marketing', 'N/A', 'N/A', 'Assisting with campus event registrations and student venue coordination.'],
  ['Aparna Sambhari', 'Marketing Team Head', 'Event & Marketing', '3rd Year', 'N/A', 'Spearheading marketing strategy, campus campaigns, and awareness drives.'],
  ['Ankit Tiwari', 'Social Media Team Head', 'Media & Engagement', '3rd Year', 'N/A', 'Directing social media channels, digital branding, and online announcements.'],
  ['Mansi Nikumbh', 'Social Media Team Co-Head', 'Media & Engagement', '3rd Year', 'N/A', 'Creating visual content, campaign posts, and community media updates.'],
  ['Pratima', 'Student Engagement Head', 'Media & Engagement', '3rd Year', 'N/A', 'Guiding students through idea submission, onboarding, and pitch readiness.'],
  ['Komal Sonawane', 'Student Engagement Co-Head', 'Media & Engagement', '3rd Year', 'N/A', 'Answering student queries, managing support desks, and community chats.'],
  ['Mahesh Gaikwad', 'Videographer & Video Editor', 'Media & Production', 'N/A', 'N/A', 'Capturing event coverage and producing high-quality video content and edits.'],
  ['Siddam Vaibhav', 'Videographer & Video Editor', 'Media & Production', 'N/A', 'N/A', 'Managing on-field media coverage, cinematography, and post-production video editing.'],
  ['Kamsali Yashwanth', 'Videographer & Video Editor', 'Media & Production', 'N/A', 'N/A', 'Handling event shoot direction, video montages, and visual storytelling.'],
  ['Rohan Kolla', 'Videographer', 'Media & Production', 'N/A', 'N/A', 'Operating visual recording gear and capturing key event moments across campus.'],
  ['Chityala Manikanteswarareddy', 'Video Editor', 'Media & Production', 'N/A', 'N/A', 'Executing video assembly, audio synthesis, and visual promotional edits.'],
  ['Prathmesh Patil', 'Video Editor', 'Media & Production', 'N/A', 'N/A', 'Designing promotional reels, teaser edits, and pitch night highlights.'],
  ['Tejas Adhav Patil', 'Sponsorship Team Head', 'Sponsorship', '3rd Year', 'N/A', 'Building corporate alliances, industry sponsorships, and VC mentor links.'],
  ['Yash Dange', 'Sponsorship Team Co-Head', 'Sponsorship', '3rd Year', 'N/A', 'Managing partner relations and pitch competition prize pool packages.'],
];

const EVENTS = [
  {
    title: 'Sun Launchpad 2026',
    edition: 'Sun Entrepreneurship Club',
    category: 'Acceleration Drive',
    description: "Sandip University's flagship student acceleration drive. Submit your idea, receive mentorship, and pitch on stage.",
    venue: 'Sandip University Campus',
    timeLabel: 'DATES TO BE ANNOUNCED',
    status: 'ongoing',
    maxSeats: null,
    isPublished: true,
    order: 0,
  },
  {
    title: 'Incubation Program',
    edition: 'Sun Entrepreneurship Club',
    category: 'Incubation',
    description: 'Structured incubation support for validated student startups, offering dedicated workspace, mentorship, and seed resources.',
    venue: 'Sandip University Campus',
    timeLabel: 'DATES TO BE ANNOUNCED',
    status: 'upcoming',
    maxSeats: null,
    isPublished: true,
    order: 1,
  },
  {
    title: 'Alumni Meetup',
    edition: 'Sun Entrepreneurship Club',
    category: 'Networking & Community',
    description: 'Interactive networking session connecting current student founders with university alumni entrepreneurs and industry mentors.',
    venue: 'Sandip University Campus',
    timeLabel: 'DATES TO BE ANNOUNCED',
    status: 'upcoming',
    maxSeats: null,
    isPublished: true,
    order: 2,
  },
];

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('Set MONGODB_URI in backend/.env first (your Atlas link).');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected. Seeding…');

  let t = 0;
  for (let i = 0; i < TEAM.length; i++) {
    const [name, role, category, year, branch, bio] = TEAM[i];
    await TeamMember.updateOne(
      { name },
      { $set: { name, role, category, year, branch, bio, order: i, isActive: true } },
      { upsert: true }
    );
    t++;
  }
  let e = 0;
  for (const ev of EVENTS) {
    await Event.updateOne({ title: ev.title }, { $set: ev }, { upsert: true });
    e++;
  }
  console.log(`Done. Team members: ${t}, events: ${e}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
