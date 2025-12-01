import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { insertCustomerSchema, insertProjectSchema, insertRoomSchema, insertEditorSchema, insertBookingSchema, insertEditorLeaveSchema, insertChalanSchema, insertChalanItemSchema, insertUserSchema, loginSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(server: Server, app: Express): Promise<void> {
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      const user = await storage.getUserByUsername(data.username);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      if (user.securityPin !== data.securityPin) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      if (!user.isActive) {
        return res.status(401).json({ message: "Account is inactive" });
      }
      
      const { password, securityPin, ...userWithoutSensitive } = user;
      res.json({ user: userWithoutSensitive });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Companies routes
  app.get("/api/companies", async (req, res) => {
    try {
      const companies = await storage.getCompanies();
      res.json(companies);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/companies", async (req, res) => {
    try {
      const company = await storage.createCompany(req.body);
      res.status(201).json(company);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Users routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      const sanitized = users.map(({ password, securityPin, ...u }) => u);
      res.json(sanitized);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      const user = await storage.createUser(data);
      const { password, securityPin, ...sanitized } = user;
      res.status(201).json(sanitized);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.updateUser(id, req.body);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, securityPin, ...sanitized } = user;
      res.json(sanitized);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteUser(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/users/:id/access", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const access = await storage.getUserAccess(id);
      res.json(access);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/users/:id/access", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.setUserAccess(id, req.body.access);
      res.status(200).json({ message: "Access updated" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Customers routes
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/customers/:id/contacts", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contacts = await storage.getCustomerContacts(id);
      res.json(contacts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const { contacts, ...customerData } = req.body;
      const data = insertCustomerSchema.parse(customerData);
      const customer = await storage.createCustomer(data, contacts);
      res.status(201).json(customer);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { contacts, ...customerData } = req.body;
      const customer = await storage.updateCustomer(id, customerData, contacts);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCustomer(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Projects routes
  app.get("/api/projects", async (req, res) => {
    try {
      const customerId = req.query.customerId ? parseInt(req.query.customerId as string) : undefined;
      const projects = await storage.getProjects(customerId);
      res.json(projects);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const data = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(data);
      res.status(201).json(project);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.updateProject(id, req.body);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProject(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Rooms routes
  app.get("/api/rooms", async (req, res) => {
    try {
      const rooms = await storage.getRooms();
      res.json(rooms);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/rooms", async (req, res) => {
    try {
      const data = insertRoomSchema.parse(req.body);
      const room = await storage.createRoom(data);
      res.status(201).json(room);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/rooms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const room = await storage.updateRoom(id, req.body);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      res.json(room);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/rooms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteRoom(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Editors routes
  app.get("/api/editors", async (req, res) => {
    try {
      const editors = await storage.getEditors();
      res.json(editors);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/editors", async (req, res) => {
    try {
      const data = insertEditorSchema.parse(req.body);
      const editor = await storage.createEditor(data);
      res.status(201).json(editor);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/editors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const editor = await storage.updateEditor(id, req.body);
      if (!editor) {
        return res.status(404).json({ message: "Editor not found" });
      }
      res.json(editor);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/editors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteEditor(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Bookings routes
  app.get("/api/bookings", async (req, res) => {
    try {
      const filters = {
        from: req.query.from as string | undefined,
        to: req.query.to as string | undefined,
        roomId: req.query.roomId ? parseInt(req.query.roomId as string) : undefined,
        customerId: req.query.customerId ? parseInt(req.query.customerId as string) : undefined,
        editorId: req.query.editorId ? parseInt(req.query.editorId as string) : undefined,
        status: req.query.status as string | undefined,
      };
      const bookings = await storage.getBookings(filters);
      res.json(bookings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/bookings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const booking = await storage.getBooking(id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/bookings/:id/logs", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const logs = await storage.getBookingLogs(id);
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/bookings", async (req, res) => {
    try {
      const { repeatDays, ...bookingData } = req.body;
      const data = insertBookingSchema.parse(bookingData);
      
      const bookings = [];
      const baseDate = new Date(data.bookingDate);
      
      for (let i = 0; i <= (repeatDays || 0); i++) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() + i);
        const booking = await storage.createBooking({
          ...data,
          bookingDate: date.toISOString().split("T")[0],
        });
        bookings.push(booking);
      }
      
      res.status(201).json(bookings.length === 1 ? bookings[0] : bookings);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/bookings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const booking = await storage.updateBooking(id, req.body);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/bookings/:id/cancel", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { reason } = req.body;
      if (!reason) {
        return res.status(400).json({ message: "Reason is required" });
      }
      const booking = await storage.cancelBooking(id, reason);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Editor Leaves routes
  app.get("/api/editor-leaves", async (req, res) => {
    try {
      const editorId = req.query.editorId ? parseInt(req.query.editorId as string) : undefined;
      const leaves = await storage.getEditorLeaves(editorId);
      res.json(leaves);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/editor-leaves", async (req, res) => {
    try {
      const data = insertEditorLeaveSchema.parse(req.body);
      const leave = await storage.createEditorLeave(data);
      res.status(201).json(leave);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/editor-leaves/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const leave = await storage.updateEditorLeave(id, req.body);
      if (!leave) {
        return res.status(404).json({ message: "Leave not found" });
      }
      res.json(leave);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/editor-leaves/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteEditorLeave(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Chalans routes
  app.get("/api/chalans", async (req, res) => {
    try {
      const filters = {
        from: req.query.from as string | undefined,
        to: req.query.to as string | undefined,
        customerId: req.query.customerId ? parseInt(req.query.customerId as string) : undefined,
      };
      const chalans = await storage.getChalans(filters);
      res.json(chalans);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/chalans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const chalan = await storage.getChalan(id);
      if (!chalan) {
        return res.status(404).json({ message: "Chalan not found" });
      }
      res.json(chalan);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/chalans/:id/revisions", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const revisions = await storage.getChalanRevisions(id);
      res.json(revisions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/chalans", async (req, res) => {
    try {
      const { items, ...chalanData } = req.body;
      const data = insertChalanSchema.parse(chalanData);
      const chalan = await storage.createChalan(data, items || []);
      res.status(201).json(chalan);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/chalans/:id/cancel", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { reason } = req.body;
      if (!reason) {
        return res.status(400).json({ message: "Reason is required" });
      }
      const chalan = await storage.cancelChalan(id, reason);
      if (!chalan) {
        return res.status(404).json({ message: "Chalan not found" });
      }
      res.json(chalan);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/chalans/:id/revise", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { changes } = req.body;
      if (!changes) {
        return res.status(400).json({ message: "Changes description is required" });
      }
      const revision = await storage.createChalanRevision(id, changes);
      res.status(201).json(revision);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/chalans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.cancelChalan(id, "Deleted");
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Reports routes
  app.get("/api/reports/conflicts", async (req, res) => {
    try {
      const from = req.query.from as string;
      const to = req.query.to as string;
      const roomId = req.query.roomId && req.query.roomId !== "all" ? parseInt(req.query.roomId as string) : undefined;
      const editorId = req.query.editorId && req.query.editorId !== "all" ? parseInt(req.query.editorId as string) : undefined;
      
      if (!from || !to) {
        return res.status(400).json({ message: "from and to dates are required" });
      }
      
      const conflicts = await storage.getConflicts(from, to, roomId, editorId);
      res.json(conflicts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/reports/editors", async (req, res) => {
    try {
      const from = req.query.from as string;
      const to = req.query.to as string;
      const editorId = req.query.editorId && req.query.editorId !== "all" ? parseInt(req.query.editorId as string) : undefined;
      
      if (!from || !to) {
        return res.status(400).json({ message: "from and to dates are required" });
      }
      
      const reports = await storage.getEditorReport(from, to, editorId);
      res.json(reports);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
}
