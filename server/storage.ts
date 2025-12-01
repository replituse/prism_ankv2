import { db } from "./db";
import { eq, and, gte, lte, sql, desc, or } from "drizzle-orm";
import {
  companies,
  users,
  customers,
  customerContacts,
  projects,
  rooms,
  editors,
  bookings,
  bookingLogs,
  editorLeaves,
  chalans,
  chalanItems,
  chalanRevisions,
  userModuleAccess,
  type Company,
  type InsertCompany,
  type User,
  type InsertUser,
  type Customer,
  type InsertCustomer,
  type CustomerContact,
  type InsertCustomerContact,
  type Project,
  type InsertProject,
  type Room,
  type InsertRoom,
  type Editor,
  type InsertEditor,
  type Booking,
  type InsertBooking,
  type BookingLog,
  type InsertBookingLog,
  type EditorLeave,
  type InsertEditorLeave,
  type Chalan,
  type InsertChalan,
  type ChalanItem,
  type InsertChalanItem,
  type ChalanRevision,
  type InsertChalanRevision,
  type UserModuleAccess,
  type InsertUserModuleAccess,
} from "@shared/schema";

export interface IStorage {
  // Companies
  getCompanies(): Promise<Company[]>;
  getCompany(id: number): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company | undefined>;
  deleteCompany(id: number): Promise<boolean>;

  // Users
  getUsers(): Promise<(User & { company?: Company })[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getUserAccess(userId: number): Promise<UserModuleAccess[]>;
  setUserAccess(userId: number, access: InsertUserModuleAccess[]): Promise<void>;

  // Customers
  getCustomers(): Promise<(Customer & { contacts?: CustomerContact[] })[]>;
  getCustomer(id: number): Promise<(Customer & { contacts?: CustomerContact[] }) | undefined>;
  createCustomer(customer: InsertCustomer, contacts?: InsertCustomerContact[]): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>, contacts?: InsertCustomerContact[]): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<boolean>;
  getCustomerContacts(customerId: number): Promise<CustomerContact[]>;

  // Projects
  getProjects(customerId?: number): Promise<(Project & { customer?: Customer })[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;

  // Rooms
  getRooms(): Promise<Room[]>;
  getRoom(id: number): Promise<Room | undefined>;
  createRoom(room: InsertRoom): Promise<Room>;
  updateRoom(id: number, room: Partial<InsertRoom>): Promise<Room | undefined>;
  deleteRoom(id: number): Promise<boolean>;

  // Editors
  getEditors(): Promise<Editor[]>;
  getEditor(id: number): Promise<Editor | undefined>;
  createEditor(editor: InsertEditor): Promise<Editor>;
  updateEditor(id: number, editor: Partial<InsertEditor>): Promise<Editor | undefined>;
  deleteEditor(id: number): Promise<boolean>;

  // Bookings
  getBookings(filters?: { from?: string; to?: string; roomId?: number; customerId?: number; editorId?: number; status?: string }): Promise<any[]>;
  getBooking(id: number): Promise<any | undefined>;
  createBooking(booking: InsertBooking, userId?: number): Promise<Booking>;
  updateBooking(id: number, booking: Partial<InsertBooking>, userId?: number): Promise<Booking | undefined>;
  cancelBooking(id: number, reason: string, userId?: number): Promise<Booking | undefined>;
  getBookingLogs(bookingId: number): Promise<BookingLog[]>;

  // Editor Leaves
  getEditorLeaves(editorId?: number): Promise<(EditorLeave & { editor?: Editor })[]>;
  getEditorLeave(id: number): Promise<EditorLeave | undefined>;
  createEditorLeave(leave: InsertEditorLeave): Promise<EditorLeave>;
  updateEditorLeave(id: number, leave: Partial<InsertEditorLeave>): Promise<EditorLeave | undefined>;
  deleteEditorLeave(id: number): Promise<boolean>;

  // Chalans
  getChalans(filters?: { from?: string; to?: string; customerId?: number }): Promise<any[]>;
  getChalan(id: number): Promise<any | undefined>;
  createChalan(chalan: InsertChalan, items: InsertChalanItem[]): Promise<Chalan>;
  cancelChalan(id: number, reason: string): Promise<Chalan | undefined>;
  getChalanRevisions(chalanId: number): Promise<ChalanRevision[]>;
  createChalanRevision(chalanId: number, changes: string, userId?: number): Promise<ChalanRevision>;

  // Reports
  getConflicts(from: string, to: string, roomId?: number, editorId?: number): Promise<any[]>;
  getEditorReport(from: string, to: string, editorId?: number): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  // Companies
  async getCompanies(): Promise<Company[]> {
    return db.select().from(companies);
  }

  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const [created] = await db.insert(companies).values(company).returning();
    return created;
  }

  async updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company | undefined> {
    const [updated] = await db.update(companies).set(company).where(eq(companies.id, id)).returning();
    return updated;
  }

  async deleteCompany(id: number): Promise<boolean> {
    const result = await db.delete(companies).where(eq(companies.id, id));
    return true;
  }

  // Users
  async getUsers(): Promise<(User & { company?: Company })[]> {
    const result = await db
      .select()
      .from(users)
      .leftJoin(companies, eq(users.companyId, companies.id));
    
    return result.map(r => ({
      ...r.users,
      company: r.companies || undefined,
    }));
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const [updated] = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return updated;
  }

  async deleteUser(id: number): Promise<boolean> {
    await db.delete(users).where(eq(users.id, id));
    return true;
  }

  async getUserAccess(userId: number): Promise<UserModuleAccess[]> {
    return db.select().from(userModuleAccess).where(eq(userModuleAccess.userId, userId));
  }

  async setUserAccess(userId: number, access: InsertUserModuleAccess[]): Promise<void> {
    await db.delete(userModuleAccess).where(eq(userModuleAccess.userId, userId));
    if (access.length > 0) {
      await db.insert(userModuleAccess).values(access.map(a => ({ ...a, userId })));
    }
  }

  // Customers
  async getCustomers(): Promise<(Customer & { contacts?: CustomerContact[] })[]> {
    const customersList = await db.select().from(customers);
    const contactsList = await db.select().from(customerContacts);
    
    return customersList.map(c => ({
      ...c,
      contacts: contactsList.filter(contact => contact.customerId === c.id),
    }));
  }

  async getCustomer(id: number): Promise<(Customer & { contacts?: CustomerContact[] }) | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    if (!customer) return undefined;
    
    const contacts = await db.select().from(customerContacts).where(eq(customerContacts.customerId, id));
    return { ...customer, contacts };
  }

  async createCustomer(customer: InsertCustomer, contacts?: InsertCustomerContact[]): Promise<Customer> {
    const [created] = await db.insert(customers).values(customer).returning();
    
    if (contacts && contacts.length > 0) {
      await db.insert(customerContacts).values(
        contacts.map(c => ({ ...c, customerId: created.id }))
      );
    }
    
    return created;
  }

  async updateCustomer(id: number, customer: Partial<InsertCustomer>, contacts?: InsertCustomerContact[]): Promise<Customer | undefined> {
    const [updated] = await db.update(customers).set(customer).where(eq(customers.id, id)).returning();
    
    if (contacts !== undefined) {
      await db.delete(customerContacts).where(eq(customerContacts.customerId, id));
      if (contacts.length > 0) {
        await db.insert(customerContacts).values(
          contacts.map(c => ({ ...c, customerId: id }))
        );
      }
    }
    
    return updated;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    await db.delete(customerContacts).where(eq(customerContacts.customerId, id));
    await db.delete(customers).where(eq(customers.id, id));
    return true;
  }

  async getCustomerContacts(customerId: number): Promise<CustomerContact[]> {
    return db.select().from(customerContacts).where(eq(customerContacts.customerId, customerId));
  }

  // Projects
  async getProjects(customerId?: number): Promise<(Project & { customer?: Customer })[]> {
    const query = customerId
      ? db.select().from(projects).leftJoin(customers, eq(projects.customerId, customers.id)).where(eq(projects.customerId, customerId))
      : db.select().from(projects).leftJoin(customers, eq(projects.customerId, customers.id));
    
    const result = await query;
    return result.map(r => ({
      ...r.projects,
      customer: r.customers || undefined,
    }));
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [created] = await db.insert(projects).values(project).returning();
    return created;
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    const [updated] = await db.update(projects).set(project).where(eq(projects.id, id)).returning();
    return updated;
  }

  async deleteProject(id: number): Promise<boolean> {
    await db.delete(projects).where(eq(projects.id, id));
    return true;
  }

  // Rooms
  async getRooms(): Promise<Room[]> {
    return db.select().from(rooms);
  }

  async getRoom(id: number): Promise<Room | undefined> {
    const [room] = await db.select().from(rooms).where(eq(rooms.id, id));
    return room;
  }

  async createRoom(room: InsertRoom): Promise<Room> {
    const [created] = await db.insert(rooms).values(room).returning();
    return created;
  }

  async updateRoom(id: number, room: Partial<InsertRoom>): Promise<Room | undefined> {
    const [updated] = await db.update(rooms).set(room).where(eq(rooms.id, id)).returning();
    return updated;
  }

  async deleteRoom(id: number): Promise<boolean> {
    await db.delete(rooms).where(eq(rooms.id, id));
    return true;
  }

  // Editors
  async getEditors(): Promise<Editor[]> {
    return db.select().from(editors);
  }

  async getEditor(id: number): Promise<Editor | undefined> {
    const [editor] = await db.select().from(editors).where(eq(editors.id, id));
    return editor;
  }

  async createEditor(editor: InsertEditor): Promise<Editor> {
    const [created] = await db.insert(editors).values(editor).returning();
    return created;
  }

  async updateEditor(id: number, editor: Partial<InsertEditor>): Promise<Editor | undefined> {
    const [updated] = await db.update(editors).set(editor).where(eq(editors.id, id)).returning();
    return updated;
  }

  async deleteEditor(id: number): Promise<boolean> {
    await db.delete(editors).where(eq(editors.id, id));
    return true;
  }

  // Bookings
  async getBookings(filters?: { from?: string; to?: string; roomId?: number; customerId?: number; editorId?: number; status?: string }): Promise<any[]> {
    let query = db
      .select()
      .from(bookings)
      .leftJoin(rooms, eq(bookings.roomId, rooms.id))
      .leftJoin(customers, eq(bookings.customerId, customers.id))
      .leftJoin(projects, eq(bookings.projectId, projects.id))
      .leftJoin(editors, eq(bookings.editorId, editors.id))
      .leftJoin(customerContacts, eq(bookings.contactId, customerContacts.id));

    const conditions = [];
    if (filters?.from) {
      conditions.push(gte(bookings.bookingDate, filters.from));
    }
    if (filters?.to) {
      conditions.push(lte(bookings.bookingDate, filters.to));
    }
    if (filters?.roomId) {
      conditions.push(eq(bookings.roomId, filters.roomId));
    }
    if (filters?.customerId) {
      conditions.push(eq(bookings.customerId, filters.customerId));
    }
    if (filters?.editorId) {
      conditions.push(eq(bookings.editorId, filters.editorId));
    }
    if (filters?.status) {
      conditions.push(eq(bookings.status, filters.status as any));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const result = await query;
    return result.map(r => ({
      ...r.bookings,
      room: r.rooms || undefined,
      customer: r.customers || undefined,
      project: r.projects || undefined,
      editor: r.editors || undefined,
      contact: r.customer_contacts || undefined,
    }));
  }

  async getBooking(id: number): Promise<any | undefined> {
    const [result] = await db
      .select()
      .from(bookings)
      .leftJoin(rooms, eq(bookings.roomId, rooms.id))
      .leftJoin(customers, eq(bookings.customerId, customers.id))
      .leftJoin(projects, eq(bookings.projectId, projects.id))
      .leftJoin(editors, eq(bookings.editorId, editors.id))
      .where(eq(bookings.id, id));

    if (!result) return undefined;

    return {
      ...result.bookings,
      room: result.rooms || undefined,
      customer: result.customers || undefined,
      project: result.projects || undefined,
      editor: result.editors || undefined,
    };
  }

  async createBooking(booking: InsertBooking, userId?: number): Promise<Booking> {
    const [created] = await db.insert(bookings).values(booking).returning();
    
    await db.insert(bookingLogs).values({
      bookingId: created.id,
      userId: userId || null,
      action: "Created",
      changes: `Booking created for ${booking.bookingDate}`,
    });
    
    return created;
  }

  async updateBooking(id: number, booking: Partial<InsertBooking>, userId?: number): Promise<Booking | undefined> {
    const [updated] = await db
      .update(bookings)
      .set({ ...booking, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    
    if (updated) {
      await db.insert(bookingLogs).values({
        bookingId: id,
        userId: userId || null,
        action: "Updated",
        changes: `Booking updated`,
      });
    }
    
    return updated;
  }

  async cancelBooking(id: number, reason: string, userId?: number): Promise<Booking | undefined> {
    const [updated] = await db
      .update(bookings)
      .set({
        status: "cancelled",
        cancelReason: reason,
        cancelledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, id))
      .returning();
    
    if (updated) {
      await db.insert(bookingLogs).values({
        bookingId: id,
        userId: userId || null,
        action: "Cancelled",
        changes: `Reason: ${reason}`,
      });
    }
    
    return updated;
  }

  async getBookingLogs(bookingId: number): Promise<BookingLog[]> {
    return db
      .select()
      .from(bookingLogs)
      .where(eq(bookingLogs.bookingId, bookingId))
      .orderBy(desc(bookingLogs.createdAt));
  }

  // Editor Leaves
  async getEditorLeaves(editorId?: number): Promise<(EditorLeave & { editor?: Editor })[]> {
    let query = db
      .select()
      .from(editorLeaves)
      .leftJoin(editors, eq(editorLeaves.editorId, editors.id));

    if (editorId) {
      query = query.where(eq(editorLeaves.editorId, editorId)) as any;
    }

    const result = await query;
    return result.map(r => ({
      ...r.editor_leaves,
      editor: r.editors || undefined,
    }));
  }

  async getEditorLeave(id: number): Promise<EditorLeave | undefined> {
    const [leave] = await db.select().from(editorLeaves).where(eq(editorLeaves.id, id));
    return leave;
  }

  async createEditorLeave(leave: InsertEditorLeave): Promise<EditorLeave> {
    const [created] = await db.insert(editorLeaves).values(leave).returning();
    return created;
  }

  async updateEditorLeave(id: number, leave: Partial<InsertEditorLeave>): Promise<EditorLeave | undefined> {
    const [updated] = await db.update(editorLeaves).set(leave).where(eq(editorLeaves.id, id)).returning();
    return updated;
  }

  async deleteEditorLeave(id: number): Promise<boolean> {
    await db.delete(editorLeaves).where(eq(editorLeaves.id, id));
    return true;
  }

  // Chalans
  async getChalans(filters?: { from?: string; to?: string; customerId?: number }): Promise<any[]> {
    let query = db
      .select()
      .from(chalans)
      .leftJoin(customers, eq(chalans.customerId, customers.id))
      .leftJoin(projects, eq(chalans.projectId, projects.id));

    const conditions = [];
    if (filters?.from) {
      conditions.push(gte(chalans.chalanDate, filters.from));
    }
    if (filters?.to) {
      conditions.push(lte(chalans.chalanDate, filters.to));
    }
    if (filters?.customerId) {
      conditions.push(eq(chalans.customerId, filters.customerId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const result = await query.orderBy(desc(chalans.chalanDate));
    
    const chalanIds = result.map(r => r.chalans.id);
    const items = chalanIds.length > 0
      ? await db.select().from(chalanItems).where(sql`${chalanItems.chalanId} = ANY(${chalanIds})`)
      : [];
    const revisions = chalanIds.length > 0
      ? await db.select().from(chalanRevisions).where(sql`${chalanRevisions.chalanId} = ANY(${chalanIds})`)
      : [];

    return result.map(r => ({
      ...r.chalans,
      customer: r.customers || undefined,
      project: r.projects || undefined,
      items: items.filter(i => i.chalanId === r.chalans.id),
      revisions: revisions.filter(rev => rev.chalanId === r.chalans.id),
    }));
  }

  async getChalan(id: number): Promise<any | undefined> {
    const [result] = await db
      .select()
      .from(chalans)
      .leftJoin(customers, eq(chalans.customerId, customers.id))
      .leftJoin(projects, eq(chalans.projectId, projects.id))
      .where(eq(chalans.id, id));

    if (!result) return undefined;

    const items = await db.select().from(chalanItems).where(eq(chalanItems.chalanId, id));
    const revisions = await db.select().from(chalanRevisions).where(eq(chalanRevisions.chalanId, id));

    return {
      ...result.chalans,
      customer: result.customers || undefined,
      project: result.projects || undefined,
      items,
      revisions,
    };
  }

  async createChalan(chalan: InsertChalan, items: InsertChalanItem[]): Promise<Chalan> {
    const chalanNumber = `CH-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const [created] = await db.insert(chalans).values({
      ...chalan,
      chalanNumber,
    }).returning();

    if (items.length > 0) {
      await db.insert(chalanItems).values(
        items.map(item => ({ ...item, chalanId: created.id }))
      );
    }

    await db.update(projects).set({ hasChalanCreated: true }).where(eq(projects.id, chalan.projectId));

    return created;
  }

  async cancelChalan(id: number, reason: string): Promise<Chalan | undefined> {
    const [updated] = await db
      .update(chalans)
      .set({ isCancelled: true, cancelReason: reason })
      .where(eq(chalans.id, id))
      .returning();
    return updated;
  }

  async getChalanRevisions(chalanId: number): Promise<ChalanRevision[]> {
    return db
      .select()
      .from(chalanRevisions)
      .where(eq(chalanRevisions.chalanId, chalanId))
      .orderBy(desc(chalanRevisions.createdAt));
  }

  async createChalanRevision(chalanId: number, changes: string, userId?: number): Promise<ChalanRevision> {
    const existingRevisions = await this.getChalanRevisions(chalanId);
    const revisionNumber = existingRevisions.length + 1;

    const [created] = await db.insert(chalanRevisions).values({
      chalanId,
      revisionNumber,
      changes,
      revisedBy: userId || null,
    }).returning();

    return created;
  }

  // Reports
  async getConflicts(from: string, to: string, roomId?: number, editorId?: number): Promise<any[]> {
    const allBookings = await this.getBookings({ from, to, roomId, editorId });
    const activeBookings = allBookings.filter(b => b.status !== "cancelled");
    
    const conflicts: { booking1: any; booking2: any }[] = [];
    
    for (let i = 0; i < activeBookings.length; i++) {
      for (let j = i + 1; j < activeBookings.length; j++) {
        const b1 = activeBookings[i];
        const b2 = activeBookings[j];
        
        if (b1.bookingDate !== b2.bookingDate) continue;
        
        const hasRoomConflict = b1.roomId === b2.roomId;
        const hasEditorConflict = b1.editorId && b2.editorId && b1.editorId === b2.editorId;
        
        if (!hasRoomConflict && !hasEditorConflict) continue;
        
        const from1 = b1.fromTime;
        const to1 = b1.toTime;
        const from2 = b2.fromTime;
        const to2 = b2.toTime;
        
        const overlaps = from1 < to2 && from2 < to1;
        
        if (overlaps) {
          conflicts.push({ booking1: b1, booking2: b2 });
        }
      }
    }
    
    return conflicts;
  }

  async getEditorReport(from: string, to: string, editorId?: number): Promise<any[]> {
    const editorsList = editorId
      ? await db.select().from(editors).where(eq(editors.id, editorId))
      : await db.select().from(editors).where(eq(editors.isActive, true));
    
    const reports = [];
    
    for (const editor of editorsList) {
      const editorBookings = await this.getBookings({ from, to, editorId: editor.id });
      const confirmedBookings = editorBookings.filter(b => b.status !== "cancelled");
      
      const totalHours = confirmedBookings.reduce((sum, b) => sum + (b.totalHours || 0), 0);
      const projectIds = new Set(confirmedBookings.map(b => b.projectId));
      
      reports.push({
        editor,
        bookings: confirmedBookings,
        totalHours,
        projectCount: projectIds.size,
      });
    }
    
    return reports;
  }
}

export const storage = new DatabaseStorage();
