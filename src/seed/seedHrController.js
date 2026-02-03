// controllers/hrController.js
import User from "../models/user_Model.js";

export const createHRTeamMembers = async () => {
  const hrTeamMembers = [
    {
      name: "HR Team Lead",
      email: "hr.lead@company.com",
      password: "HRLead2024!",
      role: "HR",
      department: "Human Resource & Admin",
    },
    {
      name: "HR Assistant 1",
      email: "hr.assistant1@company.com",
      password: "HRAssist1!",
      role: "HR",
      department: "Human Resource & Admin",
    },
    {
      name: "HR Assistant 2",
      email: "hr.assistant2@company.com",
      password: "HRAssist2!",
      role: "HR",
      department: "Human Resource & Admin",
    },
    {
      name: "HR Assistant 3",
      email: "hr.assistant3@company.com",
      password: "HRAssist3!",
      role: "HR",
      department: "Human Resource & Admin",
    },
  ];

  try {
    for (const member of hrTeamMembers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: member.email });

      if (existingUser) {
        console.log(`❌ User ${member.email} already exists`);
        continue;
      }

      // Create user - password will be automatically hashed by the pre("save") middleware
      await User.create(member);

      console.log(
        `✅ Created HR team member: ${member.name} (${member.email})`,
      );
    }

    console.log("✅ All HR team members created successfully");
    return { success: true, message: "HR team members created" };
  } catch (error) {
    console.error("❌ Error creating HR team members:", error);
    throw error;
  }
};
