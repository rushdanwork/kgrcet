require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('./models/Employee');

const seedEmployees = [
  { firstName: 'John', lastName: 'Doe', email: 'john.doe@company.com', role: 'CEO', department: 'Executive', position: 'Chief Executive Officer', performanceIndex: 95, hireDate: new Date('2020-01-15') },
  { firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.j@company.com', role: 'Project Manager', department: 'Product', position: 'Product Lead', performanceIndex: 92, hireDate: new Date('2021-08-20') },
  { firstName: 'Michael', lastName: 'Brown', email: 'michael.b@company.com', role: 'Manager', department: 'Engineering', position: 'Engineering Manager', performanceIndex: 88, hireDate: new Date('2022-03-10') },
  { firstName: 'Emily', lastName: 'Wilson', email: 'emily.w@company.com', role: 'Team Leader', department: 'Engineering', position: 'Senior Tech Lead', performanceIndex: 90, hireDate: new Date('2021-11-05') },
  { firstName: 'Robert', lastName: 'Davis', email: 'robert.d@company.com', role: 'Software Engineer', department: 'Engineering', position: 'Backend Engineer', performanceIndex: 85, hireDate: new Date('2022-02-15') },
  { firstName: 'Lisa', lastName: 'Chen', email: 'lisa.chen@company.com', role: 'Software Engineer', department: 'Engineering', position: 'Frontend Engineer', performanceIndex: 87, hireDate: new Date('2022-07-01') },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hrportal', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await Employee.deleteMany({});
  await Employee.insertMany(seedEmployees);
  console.log('Seed complete');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
