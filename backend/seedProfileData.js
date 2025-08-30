import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const seedProfileData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update existing users with profile data
    const users = await User.find({});
    
    for (const user of users) {
      const updateData = {
        currentEmployer: user.currentEmployer || 'RoadGuard Services',
        language: user.language || 'en',
        workHistory: user.workHistory || []
      };

      // Add sample work history based on user type
      if (user.userType === 'admin' && (!user.workHistory || user.workHistory.length === 0)) {
        updateData.workHistory = [
          {
            position: 'Workshop Owner',
            company: 'RoadGuard Services',
            startDate: '2020',
            endDate: 'Present',
            description: 'Founded and managing RoadGuard Services, overseeing all operations and strategic decisions.',
            isCurrent: true
          },
          {
            position: 'Senior Automotive Manager',
            company: 'AutoCare Solutions',
            startDate: '2015',
            endDate: '2020',
            description: 'Managed automotive service operations and led a team of 20+ technicians.',
            isCurrent: false
          }
        ];
      } else if (user.userType === 'worker' && (!user.workHistory || user.workHistory.length === 0)) {
        updateData.workHistory = [
          {
            position: 'Senior Mechanic',
            company: 'RoadGuard Services',
            startDate: '2022',
            endDate: 'Present',
            description: 'Leading roadside assistance operations and managing emergency repairs.',
            isCurrent: true
          },
          {
            position: 'Automotive Technician',
            company: 'AutoCare Plus',
            startDate: '2020',
            endDate: '2022',
            description: 'Performed vehicle diagnostics and repairs in workshop environment.',
            isCurrent: false
          },
          {
            position: 'Junior Mechanic',
            company: 'QuickFix Motors',
            startDate: '2018',
            endDate: '2020',
            description: 'Entry-level position focusing on basic maintenance and repairs.',
            isCurrent: false
          }
        ];
      } else if (user.userType === 'user' && (!user.workHistory || user.workHistory.length === 0)) {
        updateData.workHistory = [
          {
            position: 'Fleet Manager',
            company: 'City Transport',
            startDate: '2021',
            endDate: 'Present',
            description: 'Managing company vehicle fleet and coordinating maintenance schedules.',
            isCurrent: true
          },
          {
            position: 'Operations Coordinator',
            company: 'Logistics Pro',
            startDate: '2019',
            endDate: '2021',
            description: 'Coordinated transportation operations and managed vendor relationships.',
            isCurrent: false
          }
        ];
      }

      await User.findByIdAndUpdate(user._id, updateData);
      console.log(`Updated profile data for user: ${user.firstName} ${user.lastName}`);
    }

    console.log('Profile data seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding profile data:', error);
    process.exit(1);
  }
};

seedProfileData();