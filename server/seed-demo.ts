import { db } from "./db";
import { 
  companies, 
  users, 
  customers, 
  customerContacts,
  projects, 
  rooms, 
  editors, 
  bookings, 
  editorLeaves,
  chalans,
  chalanItems
} from "@shared/schema";
import { eq } from "drizzle-orm";

async function seedDemoData() {
  console.log("Seeding demo data for December 2025...");

  // Get existing companies
  const existingCompanies = await db.select().from(companies);
  if (existingCompanies.length === 0) {
    console.log("No companies found. Please run the main seed first.");
    return;
  }

  const prismCompany = existingCompanies.find(c => c.name === "PRISM");
  const airavataCompany = existingCompanies.find(c => c.name === "Airavata Studio");

  if (!prismCompany || !airavataCompany) {
    console.log("Required companies not found.");
    return;
  }

  // Check if demo data already exists
  const existingCustomers = await db.select().from(customers);
  if (existingCustomers.length > 0) {
    console.log("Demo data already exists, skipping...");
    return;
  }

  // Create Demo Customers (10)
  const customerData = [
    { name: "Dharma Productions", companyName: "Dharma Productions Pvt Ltd", address: "Bandra, Mumbai", phone: "9876543210", email: "contact@dharma.com", gstNumber: "27AABCD1234F1Z5" },
    { name: "Yash Raj Films", companyName: "Yash Raj Films", address: "Andheri, Mumbai", phone: "9876543211", email: "info@yrf.com", gstNumber: "27AABCY1234G1Z6" },
    { name: "Red Chillies Entertainment", companyName: "Red Chillies Entertainment", address: "Juhu, Mumbai", phone: "9876543212", email: "contact@redchillies.com", gstNumber: "27AABCR1234H1Z7" },
    { name: "Balaji Motion Pictures", companyName: "Balaji Telefilms Ltd", address: "Goregaon, Mumbai", phone: "9876543213", email: "films@balaji.com", gstNumber: "27AABCB1234I1Z8" },
    { name: "Excel Entertainment", companyName: "Excel Entertainment", address: "Khar, Mumbai", phone: "9876543214", email: "info@excel.com", gstNumber: "27AABCE1234J1Z9" },
    { name: "Maddock Films", companyName: "Maddock Films Pvt Ltd", address: "Versova, Mumbai", phone: "9876543215", email: "contact@maddock.com", gstNumber: "27AABCM1234K1Z0" },
    { name: "T-Series", companyName: "T-Series Super Cassettes", address: "Noida", phone: "9876543216", email: "films@tseries.com", gstNumber: "09AABCT1234L1Z1" },
    { name: "Zee Studios", companyName: "Zee Entertainment", address: "Worli, Mumbai", phone: "9876543217", email: "studios@zee.com", gstNumber: "27AABCZ1234M1Z2" },
    { name: "Viacom18 Studios", companyName: "Viacom18 Media Pvt Ltd", address: "Film City, Mumbai", phone: "9876543218", email: "studios@viacom18.com", gstNumber: "27AABCV1234N1Z3" },
    { name: "Eros International", companyName: "Eros International Plc", address: "Lower Parel, Mumbai", phone: "9876543219", email: "info@erosintl.com", gstNumber: "27AABCE1234O1Z4" },
  ];

  const createdCustomers: any[] = [];
  for (const cust of customerData) {
    const [customer] = await db.insert(customers).values(cust).returning();
    createdCustomers.push(customer);
    
    // Add primary contact for each customer
    await db.insert(customerContacts).values({
      customerId: customer.id,
      name: `${cust.name} Contact`,
      phone: cust.phone,
      email: cust.email,
      designation: "Production Manager",
      isPrimary: true,
    });
  }
  console.log(`Created ${createdCustomers.length} customers with contacts`);

  // Create Demo Projects (15)
  const projectData = [
    { name: "Rocky Aur Rani", customerId: createdCustomers[0].id, projectType: "movie" as const, description: "Romantic comedy film" },
    { name: "Tiger 3 VFX", customerId: createdCustomers[1].id, projectType: "movie" as const, description: "Action thriller VFX work" },
    { name: "Dunki Post Production", customerId: createdCustomers[2].id, projectType: "movie" as const, description: "Comedy drama post production" },
    { name: "Crew Movie", customerId: createdCustomers[3].id, projectType: "movie" as const, description: "Comedy film editing" },
    { name: "The Archies", customerId: createdCustomers[4].id, projectType: "movie" as const, description: "Musical drama" },
    { name: "Stree 2", customerId: createdCustomers[5].id, projectType: "movie" as const, description: "Horror comedy sequel" },
    { name: "Animal", customerId: createdCustomers[6].id, projectType: "movie" as const, description: "Action drama" },
    { name: "Gadar 2 DI", customerId: createdCustomers[7].id, projectType: "movie" as const, description: "Action drama DI" },
    { name: "Jawan Sound Mix", customerId: createdCustomers[8].id, projectType: "movie" as const, description: "Action film sound mixing" },
    { name: "Pathaan Teaser", customerId: createdCustomers[9].id, projectType: "teaser" as const, description: "Action film teaser" },
    { name: "Bigg Boss Promo", customerId: createdCustomers[8].id, projectType: "ad" as const, description: "Reality show promo" },
    { name: "Made in Heaven S3", customerId: createdCustomers[4].id, projectType: "web_series" as const, description: "Web series editing" },
    { name: "Mirzapur S4", customerId: createdCustomers[4].id, projectType: "web_series" as const, description: "Web series post production" },
    { name: "Ek Hazaaron Serial", customerId: createdCustomers[3].id, projectType: "serial" as const, description: "Daily soap editing" },
    { name: "Brand Campaign TVC", customerId: createdCustomers[6].id, projectType: "ad" as const, description: "Commercial campaign" },
  ];

  const createdProjects: any[] = [];
  for (const proj of projectData) {
    const [project] = await db.insert(projects).values(proj).returning();
    createdProjects.push(project);
  }
  console.log(`Created ${createdProjects.length} projects`);

  // Create Demo Rooms (10)
  const roomData = [
    { name: "Sound Stage A", roomType: "sound" as const, capacity: 4 },
    { name: "Sound Stage B", roomType: "sound" as const, capacity: 3 },
    { name: "Music Studio 1", roomType: "music" as const, capacity: 2 },
    { name: "VFX Bay Alpha", roomType: "vfx" as const, capacity: 5 },
    { name: "VFX Bay Beta", roomType: "vfx" as const, capacity: 4 },
    { name: "Editing Suite 1", roomType: "editing" as const, capacity: 2 },
    { name: "Editing Suite 2", roomType: "editing" as const, capacity: 2 },
    { name: "Client Lounge", roomType: "client_office" as const, capacity: 10 },
    { name: "Dubbing Studio 1", roomType: "dubbing" as const, capacity: 3 },
    { name: "Mixing Room A", roomType: "mixing" as const, capacity: 4 },
  ];

  const createdRooms: any[] = [];
  for (const room of roomData) {
    const [created] = await db.insert(rooms).values(room).returning();
    createdRooms.push(created);
  }
  console.log(`Created ${createdRooms.length} rooms`);

  // Create Demo Editors (10)
  const editorData = [
    { name: "Rajesh Kumar", editorType: "video" as const, phone: "9876540001", email: "rajesh@prism.com", joinDate: "2020-01-15" },
    { name: "Amit Sharma", editorType: "audio" as const, phone: "9876540002", email: "amit@prism.com", joinDate: "2019-06-20" },
    { name: "Priya Patel", editorType: "vfx" as const, phone: "9876540003", email: "priya@prism.com", joinDate: "2021-03-10" },
    { name: "Vikram Singh", editorType: "colorist" as const, phone: "9876540004", email: "vikram@prism.com", joinDate: "2018-08-25" },
    { name: "Neha Gupta", editorType: "video" as const, phone: "9876540005", email: "neha@prism.com", joinDate: "2022-02-01" },
    { name: "Rahul Verma", editorType: "audio" as const, phone: "9876540006", email: "rahul@prism.com", joinDate: "2020-11-15" },
    { name: "Sneha Kapoor", editorType: "di" as const, phone: "9876540007", email: "sneha@prism.com", joinDate: "2021-07-08" },
    { name: "Arjun Nair", editorType: "vfx" as const, phone: "9876540008", email: "arjun@prism.com", joinDate: "2019-04-12" },
    { name: "Kavita Reddy", editorType: "video" as const, phone: "9876540009", email: "kavita@prism.com", joinDate: "2023-01-05" },
    { name: "Sanjay Mishra", editorType: "audio" as const, phone: "9876540010", email: "sanjay@prism.com", joinDate: "2017-09-30" },
  ];

  const createdEditors: any[] = [];
  for (const editor of editorData) {
    const [created] = await db.insert(editors).values(editor).returning();
    createdEditors.push(created);
  }
  console.log(`Created ${createdEditors.length} editors`);

  // Get primary contacts for booking
  const contacts = await db.select().from(customerContacts);

  // Create Demo Bookings for December 2025 (15 bookings with various statuses)
  const bookingData = [
    // Confirmed bookings
    { roomId: createdRooms[0].id, customerId: createdCustomers[0].id, projectId: createdProjects[0].id, editorId: createdEditors[0].id, bookingDate: "2025-12-02", fromTime: "09:00", toTime: "18:00", status: "confirmed" as const },
    { roomId: createdRooms[1].id, customerId: createdCustomers[1].id, projectId: createdProjects[1].id, editorId: createdEditors[1].id, bookingDate: "2025-12-03", fromTime: "10:00", toTime: "19:00", status: "confirmed" as const },
    { roomId: createdRooms[2].id, customerId: createdCustomers[2].id, projectId: createdProjects[2].id, editorId: createdEditors[5].id, bookingDate: "2025-12-04", fromTime: "08:00", toTime: "17:00", status: "confirmed" as const },
    { roomId: createdRooms[3].id, customerId: createdCustomers[3].id, projectId: createdProjects[3].id, editorId: createdEditors[2].id, bookingDate: "2025-12-05", fromTime: "09:00", toTime: "18:00", status: "confirmed" as const },
    { roomId: createdRooms[0].id, customerId: createdCustomers[4].id, projectId: createdProjects[4].id, editorId: createdEditors[0].id, bookingDate: "2025-12-08", fromTime: "09:00", toTime: "18:00", status: "confirmed" as const },
    
    // Planning bookings
    { roomId: createdRooms[5].id, customerId: createdCustomers[5].id, projectId: createdProjects[5].id, editorId: createdEditors[4].id, bookingDate: "2025-12-10", fromTime: "10:00", toTime: "18:00", status: "planning" as const },
    { roomId: createdRooms[6].id, customerId: createdCustomers[6].id, projectId: createdProjects[6].id, editorId: createdEditors[8].id, bookingDate: "2025-12-11", fromTime: "09:00", toTime: "17:00", status: "planning" as const },
    
    // Tentative bookings
    { roomId: createdRooms[4].id, customerId: createdCustomers[7].id, projectId: createdProjects[7].id, editorId: createdEditors[3].id, bookingDate: "2025-12-12", fromTime: "08:00", toTime: "20:00", status: "tentative" as const },
    { roomId: createdRooms[3].id, customerId: createdCustomers[8].id, projectId: createdProjects[8].id, editorId: createdEditors[7].id, bookingDate: "2025-12-15", fromTime: "09:00", toTime: "18:00", status: "tentative" as const },
    
    // Cancelled bookings
    { roomId: createdRooms[0].id, customerId: createdCustomers[9].id, projectId: createdProjects[9].id, editorId: createdEditors[0].id, bookingDate: "2025-12-09", fromTime: "09:00", toTime: "18:00", status: "cancelled" as const, cancelReason: "Client schedule changed" },
    
    // Conflict bookings (same room, same date - for conflict report testing)
    { roomId: createdRooms[0].id, customerId: createdCustomers[0].id, projectId: createdProjects[0].id, editorId: createdEditors[4].id, bookingDate: "2025-12-16", fromTime: "09:00", toTime: "14:00", status: "confirmed" as const },
    { roomId: createdRooms[0].id, customerId: createdCustomers[1].id, projectId: createdProjects[1].id, editorId: createdEditors[4].id, bookingDate: "2025-12-16", fromTime: "13:00", toTime: "18:00", status: "confirmed" as const },
    
    // Repeated bookings (same customer, same project)
    { roomId: createdRooms[5].id, customerId: createdCustomers[4].id, projectId: createdProjects[11].id, editorId: createdEditors[0].id, bookingDate: "2025-12-18", fromTime: "09:00", toTime: "18:00", status: "confirmed" as const },
    { roomId: createdRooms[5].id, customerId: createdCustomers[4].id, projectId: createdProjects[11].id, editorId: createdEditors[0].id, bookingDate: "2025-12-19", fromTime: "09:00", toTime: "18:00", status: "confirmed" as const },
    { roomId: createdRooms[5].id, customerId: createdCustomers[4].id, projectId: createdProjects[11].id, editorId: createdEditors[0].id, bookingDate: "2025-12-20", fromTime: "09:00", toTime: "18:00", status: "confirmed" as const },
  ];

  for (const booking of bookingData) {
    const contactId = contacts.find(c => c.customerId === booking.customerId)?.id;
    await db.insert(bookings).values({
      ...booking,
      contactId: contactId || null,
      totalHours: 8,
    });
  }
  console.log(`Created ${bookingData.length} bookings for December 2025`);

  // Create Demo Editor Leaves (for conflict testing) - 10 entries
  const leaveData = [
    { editorId: createdEditors[0].id, fromDate: "2025-12-25", toDate: "2025-12-25", reason: "Christmas Holiday" },
    { editorId: createdEditors[1].id, fromDate: "2025-12-26", toDate: "2025-12-27", reason: "Personal Leave" },
    { editorId: createdEditors[2].id, fromDate: "2025-12-31", toDate: "2025-12-31", reason: "New Year Eve" },
    { editorId: createdEditors[3].id, fromDate: "2025-12-24", toDate: "2025-12-24", reason: "Festival Leave" },
    { editorId: createdEditors[4].id, fromDate: "2025-12-17", toDate: "2025-12-17", reason: "Medical Appointment" },
    { editorId: createdEditors[5].id, fromDate: "2025-12-28", toDate: "2025-12-29", reason: "Family Function" },
    { editorId: createdEditors[6].id, fromDate: "2025-12-23", toDate: "2025-12-23", reason: "Sick Leave" },
    { editorId: createdEditors[7].id, fromDate: "2025-12-16", toDate: "2025-12-16", reason: "Personal Work" },
    { editorId: createdEditors[8].id, fromDate: "2025-12-30", toDate: "2025-12-30", reason: "Wedding Leave" },
    { editorId: createdEditors[9].id, fromDate: "2025-12-22", toDate: "2025-12-22", reason: "Emergency Leave" },
  ];

  for (const leave of leaveData) {
    await db.insert(editorLeaves).values(leave);
  }
  console.log(`Created ${leaveData.length} leave entries`);

  // Create Demo Chalans (for chalan reports)
  const chalanData = [
    { 
      chalanNumber: "CH-2025-001",
      customerId: createdCustomers[0].id,
      projectId: createdProjects[0].id,
      chalanDate: "2025-12-01",
      totalAmount: 150000,
      notes: "Post production work completed"
    },
    { 
      chalanNumber: "CH-2025-002",
      customerId: createdCustomers[1].id,
      projectId: createdProjects[1].id,
      chalanDate: "2025-12-03",
      totalAmount: 250000,
      notes: "VFX work Phase 1"
    },
    { 
      chalanNumber: "CH-2025-003",
      customerId: createdCustomers[2].id,
      projectId: createdProjects[2].id,
      chalanDate: "2025-12-05",
      totalAmount: 180000,
      notes: "Sound mixing and editing"
    },
    { 
      chalanNumber: "CH-2025-004",
      customerId: createdCustomers[4].id,
      projectId: createdProjects[4].id,
      chalanDate: "2025-12-10",
      totalAmount: 320000,
      notes: "Complete post production"
    },
    { 
      chalanNumber: "CH-2025-005",
      customerId: createdCustomers[5].id,
      projectId: createdProjects[5].id,
      chalanDate: "2025-12-12",
      totalAmount: 420000,
      notes: "VFX and DI work"
    },
    { 
      chalanNumber: "CH-2025-006",
      customerId: createdCustomers[6].id,
      projectId: createdProjects[6].id,
      chalanDate: "2025-12-14",
      totalAmount: 550000,
      notes: "Complete audio post production"
    },
    { 
      chalanNumber: "CH-2025-007",
      customerId: createdCustomers[7].id,
      projectId: createdProjects[7].id,
      chalanDate: "2025-12-16",
      totalAmount: 380000,
      notes: "DI and color grading"
    },
    { 
      chalanNumber: "CH-2025-008",
      customerId: createdCustomers[8].id,
      projectId: createdProjects[8].id,
      chalanDate: "2025-12-18",
      totalAmount: 290000,
      notes: "Sound design and mixing"
    },
    { 
      chalanNumber: "CH-2025-009",
      customerId: createdCustomers[9].id,
      projectId: createdProjects[9].id,
      chalanDate: "2025-12-20",
      totalAmount: 175000,
      notes: "Teaser editing and VFX"
    },
    { 
      chalanNumber: "CH-2025-010",
      customerId: createdCustomers[3].id,
      projectId: createdProjects[3].id,
      chalanDate: "2025-12-22",
      totalAmount: 620000,
      notes: "Full post production package"
    },
  ];

  for (const chalan of chalanData) {
    const [created] = await db.insert(chalans).values(chalan).returning();
    
    // Add chalan items
    await db.insert(chalanItems).values({
      chalanId: created.id,
      description: "Editing Hours",
      quantity: 40,
      rate: 2500,
      amount: 100000,
    });
    await db.insert(chalanItems).values({
      chalanId: created.id,
      description: "Sound Mixing",
      quantity: 10,
      rate: 5000,
      amount: 50000,
    });
    await db.insert(chalanItems).values({
      chalanId: created.id,
      description: "VFX Work",
      quantity: 20,
      rate: 3000,
      amount: 60000,
    });
  }
  console.log(`Created ${chalanData.length} chalans with items`);

  // Create additional users
  const additionalUsers = [
    { username: "gst_user", password: "user123", securityPin: "1234", role: "gst" as const, companyId: prismCompany.id, fullName: "GST User", email: "gst@prism.com", mobile: "9876500001" },
    { username: "non_gst_user", password: "user123", securityPin: "1234", role: "non_gst" as const, companyId: prismCompany.id, fullName: "Non-GST User", email: "nongst@prism.com", mobile: "9876500002" },
  ];

  for (const user of additionalUsers) {
    await db.insert(users).values(user);
  }
  console.log("Created additional demo users");

  console.log("\n=== Demo Data Summary ===");
  console.log("Customers: 10");
  console.log("Projects: 15");
  console.log("Rooms: 10");
  console.log("Editors: 10");
  console.log("Bookings: 15 (December 2025)");
  console.log("Leaves: 10");
  console.log("Chalans: 10");
  console.log("========================\n");

  console.log("Demo data seeding complete!");
}

seedDemoData().catch(console.error);
