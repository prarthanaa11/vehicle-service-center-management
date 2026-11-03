"use client";

import { useState, useEffect } from "react";

interface DashboardStats {
  totalCustomers: number;
  totalVehicles: number;
  totalBookings: number;
  pendingInvoices: number;
}

interface Customer {
  customer_id: number;
  full_name: string;
  phone: string;
  email: string | null;
  address: string | null;
}

interface Vehicle {
  vehicle_id: number;
  customer_id: number;
  registration_number: string;
  brand: string;
  model: string;
  manufacture_year: number | null;
  fuel_type: string | null;
  customer_name?: string;
}

interface Mechanic {
  mechanic_id: number;
  full_name: string;
  phone: string;
  specialization: string | null;
  availability: "Available" | "Busy" | "On Leave";
}

interface Booking {
  booking_id: number;
  vehicle_id: number;
  mechanic_id: number | null;
  booking_date: string;
  complaint: string;
  status: string;
  registration_number: string;
  brand: string;
  model: string;
  customer_name: string;
  mechanic_name: string | null;
}

interface Service {
  service_id: number;
  service_name: string;
  description: string | null;
  base_price: number;
}

interface SparePart {
  part_id: number;
  part_name: string;
  part_number: string;
  stock_quantity: number;
  unit_price: number;
}

interface RepairResult {
  repair_id: string;
  description: string;
  metadata: {
    vehicle_number: string;
    repair_type: string;
  };
  distance: number;
}

interface Invoice {
  invoice_id: number;
  booking_id: number;
  invoice_date: string;
  total_amount: number;
  status: "Unpaid" | "Partial Paid" | "Paid";
  booking_status?: string;
  registration_number?: string;
  customer_name?: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("Dashboard");

  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalVehicles: 0,
    totalBookings: 0,
    pendingInvoices: 0,
  });

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [repairResults, setRepairResults] = useState<RepairResult[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [invoiceForm, setInvoiceForm] = useState({
    booking_id: "",
    invoice_date: "",
    total_amount: "",
    status: "Unpaid",
  });

  const [editingInvoiceId, setEditingInvoiceId] =
    useState<number | null>(null);
    useEffect(() => {
  const today = new Date();
  const localDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  setInvoiceForm((prev) => ({
    ...prev,
    invoice_date: localDate,
  }));
}, []);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [customerForm, setCustomerForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    address: "",
  });

  const [vehicleForm, setVehicleForm] = useState({
    customer_id: "",
    registration_number: "",
    brand: "",
    model: "",
    manufacture_year: "",
    fuel_type: "",
  });

  const [bookingForm, setBookingForm] = useState({
    vehicle_id: "",
    mechanic_id: "",
    booking_date: "",
    complaint: "",
  });

  const [mechanicForm, setMechanicForm] = useState({
    full_name: "",
    phone: "",
    specialization: "",
    availability: "Available",
  });

  const [serviceForm, setServiceForm] = useState({
    service_name: "",
    description: "",
    base_price: "",
  });

  const [sparePartForm, setSparePartForm] = useState({
    part_name: "",
    part_number: "",
    stock_quantity: "0",
    unit_price: "",
  });

  const [editingServiceId, setEditingServiceId] =
    useState<number | null>(null);

  const [editingPartId, setEditingPartId] =
    useState<number | null>(null);

  const [repairForm, setRepairForm] = useState({
    repair_id: "",
    description: "",
    vehicle_number: "",
    repair_type: "",
  });

  const [repairSearch, setRepairSearch] = useState({
    complaint: "",
    results: "3",
  });

  const menuItems = [
    "Dashboard",
    "Customers",
    "Vehicles",
    "Bookings",
    "Mechanics",
    "Services",
    "Spare Parts",
    "Invoices",
    "Repair History",
  ];

  // -------------------------------
  // FETCH FUNCTIONS
  // -------------------------------

  async function fetchDashboardStats() {
    try {
      const response = await fetch("/api/dashboard");

      if (!response.ok) {
        throw new Error("Unable to fetch dashboard statistics");
      }

      const data = await response.json();

      setStats({
        totalCustomers: Number(data.totalCustomers),
        totalVehicles: Number(data.totalVehicles),
        totalBookings: Number(data.totalBookings),
        pendingInvoices: Number(data.pendingInvoices),
      });
    } catch (error) {
      console.error(error);
      setError("Unable to load dashboard statistics.");
    }
  }

  async function fetchCustomers() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/customers");

      if (!response.ok) {
        throw new Error("Unable to fetch customers");
      }

      setCustomers(await response.json());
    } catch (error) {
      console.error(error);
      setError("Unable to load customers.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchVehicles() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/vehicles");

      if (!response.ok) {
        throw new Error("Unable to fetch vehicles");
      }

      setVehicles(await response.json());
    } catch (error) {
      console.error(error);
      setError("Unable to load vehicles.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchMechanics() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/mechanics");

      if (!response.ok) {
        throw new Error("Unable to fetch mechanics");
      }

      setMechanics(await response.json());
    } catch (error) {
      console.error(error);
      setError("Unable to load mechanics.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchBookings() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/bookings");

      if (!response.ok) {
        throw new Error("Unable to fetch bookings");
      }

      setBookings(await response.json());
    } catch (error) {
      console.error(error);
      setError("Unable to load bookings.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchServices() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/services");

      if (!response.ok) {
        throw new Error("Unable to fetch services");
      }

      setServices(await response.json());
    } catch (error) {
      console.error(error);
      setError("Unable to load services.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchSpareParts() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/spare-parts");

      if (!response.ok) {
        throw new Error("Unable to fetch spare parts");
      }

      setSpareParts(await response.json());
    } catch (error) {
      console.error(error);
      setError("Unable to load spare parts.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchInvoices() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/invoices");

      if (!response.ok) {
        throw new Error("Unable to fetch invoices");
      }

      const data = await response.json();
      setInvoices(data);
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error ? error.message : "Unable to load invoices."
      );
    } finally {
      setLoading(false);
    }
  }

  // -------------------------------
  // LOAD DATA WHEN TAB CHANGES
  // -------------------------------

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    setError("");
    setMessage("");

    if (activeTab === "Customers") fetchCustomers();
    if (activeTab === "Dashboard") {
       fetchBookings();
       fetchInvoices();
}

    if (activeTab === "Vehicles") {
      fetchVehicles();
      fetchCustomers();
    }

    if (activeTab === "Bookings") {
      fetchBookings();
      fetchVehicles();
      fetchMechanics();
    }

    if (activeTab === "Mechanics") fetchMechanics();

    if (activeTab === "Services") fetchServices();

    if (activeTab === "Spare Parts") fetchSpareParts();

    if (activeTab === "Invoices") {
      fetchInvoices();
      fetchBookings();
    }

    if (activeTab === "Repair History") {
      fetchVehicles();
    }
  }, [activeTab]);

  // -------------------------------
  // CUSTOMER HANDLERS
  // -------------------------------

  async function handleAddCustomer(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customerForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to add customer");
      }

      setMessage("Customer added successfully!");

      setCustomerForm({
        full_name: "",
        phone: "",
        email: "",
        address: "",
      });

      await fetchCustomers();
      await fetchDashboardStats();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  }

  // -------------------------------
  // VEHICLE HANDLERS
  // -------------------------------

  async function handleAddVehicle(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await fetch("/api/vehicles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...vehicleForm,
          customer_id: Number(vehicleForm.customer_id),
          manufacture_year: vehicleForm.manufacture_year
            ? Number(vehicleForm.manufacture_year)
            : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to add vehicle");
      }

      setMessage("Vehicle added successfully!");

      setVehicleForm({
        customer_id: "",
        registration_number: "",
        brand: "",
        model: "",
        manufacture_year: "",
        fuel_type: "",
      });

      await fetchVehicles();
      await fetchDashboardStats();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  }

  // -------------------------------
  // BOOKING HANDLERS
  // -------------------------------

  async function handleAddBooking(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...bookingForm,
          vehicle_id: Number(bookingForm.vehicle_id),
          mechanic_id: bookingForm.mechanic_id
            ? Number(bookingForm.mechanic_id)
            : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to create booking");
      }

      setMessage("Booking created successfully!");

      setBookingForm({
        vehicle_id: "",
        mechanic_id: "",
        booking_date: "",
        complaint: "",
      });

      await fetchBookings();
      await fetchDashboardStats();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateBookingStatus(
    booking_id: number,
    status: string
  ) {
    try {
      setError("");
      setMessage("");

      const response = await fetch("/api/bookings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ booking_id, status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to update status");
      }

      setMessage("Booking status updated successfully!");
      await fetchBookings();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  }

  // -------------------------------
  // MECHANIC HANDLERS
  // -------------------------------

  async function handleAddMechanic(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await fetch("/api/mechanics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mechanicForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to add mechanic");
      }

      setMessage("Mechanic added successfully!");

      setMechanicForm({
        full_name: "",
        phone: "",
        specialization: "",
        availability: "Available",
      });

      await fetchMechanics();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateMechanicAvailability(
    mechanic_id: number,
    availability: string
  ) {
    try {
      setError("");
      setMessage("");

      const response = await fetch("/api/mechanics", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mechanic_id, availability }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to update availability");
      }

      setMessage("Mechanic availability updated successfully!");
      await fetchMechanics();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  }

  // -------------------------------
  // SERVICES HANDLERS
  // -------------------------------

  async function handleSaveService(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await fetch("/api/services", {
        method: editingServiceId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...serviceForm,
          base_price: Number(serviceForm.base_price),
          service_id: editingServiceId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to save service");
      }

      setMessage(
        editingServiceId
          ? "Service updated successfully!"
          : "Service added successfully!"
      );

      setServiceForm({
        service_name: "",
        description: "",
        base_price: "",
      });

      setEditingServiceId(null);

      await fetchServices();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  }

  function handleEditService(service: Service) {
    setEditingServiceId(service.service_id);

    setServiceForm({
      service_name: service.service_name,
      description: service.description || "",
      base_price: String(service.base_price),
    });

    setError("");
    setMessage("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDeleteService(service_id: number) {
    if (!window.confirm("Are you sure you want to delete this service?")) {
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `/api/services?id=${service_id}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to delete service");
      }

      setMessage("Service deleted successfully!");
      await fetchServices();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  }

  // -------------------------------
  // SPARE PARTS HANDLERS
  // -------------------------------

  async function handleSaveSparePart(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await fetch("/api/spare-parts", {
        method: editingPartId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...sparePartForm,
          stock_quantity: Number(sparePartForm.stock_quantity),
          unit_price: Number(sparePartForm.unit_price),
          part_id: editingPartId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to save spare part");
      }

      setMessage(
        editingPartId
          ? "Spare part updated successfully!"
          : "Spare part added successfully!"
      );

      setSparePartForm({
        part_name: "",
        part_number: "",
        stock_quantity: "0",
        unit_price: "",
      });

      setEditingPartId(null);

      await fetchSpareParts();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  }

  function handleEditSparePart(part: SparePart) {
    setEditingPartId(part.part_id);

    setSparePartForm({
      part_name: part.part_name,
      part_number: part.part_number,
      stock_quantity: String(part.stock_quantity),
      unit_price: String(part.unit_price),
    });

    setError("");
    setMessage("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDeleteSparePart(part_id: number) {
    if (!window.confirm("Are you sure you want to delete this spare part?")) {
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `/api/spare-parts?id=${part_id}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to delete spare part");
      }

      setMessage("Spare part deleted successfully!");
      await fetchSpareParts();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  }

  // -------------------------------
  // REPAIR HISTORY HANDLERS
  // -------------------------------

  async function handleSaveRepair(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await fetch("/api/repair-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(repairForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.error || "Unable to save repair");
      }

      setMessage("Repair history saved successfully!");

      setRepairForm({
        repair_id: "",
        description: "",
        vehicle_number: "",
        repair_type: "",
      });
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSearchRepairs(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      setMessage("");
      setRepairResults([]);

      const response = await fetch("/api/repair-history/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          complaint: repairSearch.complaint,
          results: Number(repairSearch.results),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.error || "Search failed");
      }

      setRepairResults(data.results || []);

      if (!data.results || data.results.length === 0) {
        setMessage("No similar repair records found.");
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  // -------------------------------
  // INVOICE HANDLERS
  // -------------------------------

  async function handleSaveInvoice(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await fetch("/api/invoices", {
        method: editingInvoiceId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          booking_id: Number(invoiceForm.booking_id),
          invoice_date: invoiceForm.invoice_date,
          total_amount: Number(invoiceForm.total_amount),
          status: invoiceForm.status,
          ...(editingInvoiceId ? { invoice_id: editingInvoiceId } : {}),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Unable to save invoice");
      }

      setMessage(
        editingInvoiceId
          ? "Invoice updated successfully!"
          : "Invoice created successfully!"
      );

      setInvoiceForm({
        booking_id: "",
        invoice_date: new Date().toISOString().split("T")[0],
        total_amount: "",
        status: "Unpaid",
      });

      setEditingInvoiceId(null);

      await fetchInvoices();
      await fetchDashboardStats();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  }

  function handleEditInvoice(invoice: Invoice) {
    setEditingInvoiceId(invoice.invoice_id);

    setInvoiceForm({
      booking_id: String(invoice.booking_id),
      invoice_date: invoice.invoice_date
        ? new Date(invoice.invoice_date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      total_amount: String(invoice.total_amount),
      status: invoice.status,
    });

    setError("");
    setMessage("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDeleteInvoice(invoice_id: number) {
    if (!window.confirm("Are you sure you want to delete this invoice?")) {
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `/api/invoices?id=${invoice_id}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Unable to delete invoice");
      }

      setMessage("Invoice deleted successfully!");

      await fetchInvoices();
      await fetchDashboardStats();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  }

  const statCards = [
  {
    label: "Total Customers",
    value: stats.totalCustomers,
    icon: "👥",
    color: "bg-blue-100",
  },
  {
    label: "Registered Vehicles",
    value: stats.totalVehicles,
    icon: "🚗",
    color: "bg-green-100",
  },
  {
    label: "Service Bookings",
    value: stats.totalBookings,
    icon: "🔧",
    color: "bg-purple-100",
  },
  {
    label: "Pending Invoices",
    value: stats.pendingInvoices,
    icon: "🧾",
    color: "bg-orange-100",
  },
];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 bg-gradient-to-b from-slate-950 to-slate-900 p-6 text-white shadow-2xl md:block">
        <h1 className="text-2xl font-bold">AutoCare</h1>

        <p className="mb-8 mt-2 text-sm text-slate-400">
          Vehicle Service Center
        </p>

        <nav className="space-y-2 max-h-[calc(100vh-180px)] overflow-y-auto pr-1 pb-4">
          {menuItems.map((item) => (
            <button
              key={item}
              onClick={() => {
                setActiveTab(item);
                setError("");
                setMessage("");
              }}
              className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition-all duration-200 ${
  activeTab === item
    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
    : "text-slate-300 hover:bg-slate-800 hover:text-white"
}`}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-6 left-6 text-sm text-slate-400">
          DBMS Project · 2026
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <section className="p-6 md:ml-64 md:p-10">

        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">
              VEHICLE SERVICE CENTER
            </p>

            <h2 className="mt-2 text-3xl font-bold">{activeTab}</h2>

            <p className="mt-2 text-slate-600">
              Welcome back! Manage your service center.
            </p>
          </div>

          <div className="rounded-lg bg-white px-4 py-3 text-sm shadow-sm">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-500" />
            Admin Workspace
          </div>
        </header>

        {/* DASHBOARD */}
        {activeTab === "Dashboard" && (
          <>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
  {statCards.map((stat) => (
    <div
      key={stat.label}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">
          {stat.label}
        </p>

        <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${stat.color}`}>
          {stat.icon}
        </div>
      </div>

      <p className="mt-5 text-3xl font-bold text-slate-900">
        {stat.value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        Current records
      </p>
    </div>
  ))}
  </div>
  {/* BOOKING STATUS SUMMARY */}
<div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
  <div className="mb-6">
    <h3 className="text-lg font-semibold text-slate-900">
      Booking Status Overview
    </h3>
    <p className="mt-1 text-sm text-slate-500">
      Current status of all service bookings
    </p>
  </div>

  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    {[
      {
        label: "Booked",
        count: bookings.filter((b) => b.status === "Booked").length,
        color: "bg-yellow-100 text-yellow-700",
        icon: "📅",
      },
      {
        label: "In Progress",
        count: bookings.filter((b) => b.status === "In Progress").length,
        color: "bg-blue-100 text-blue-700",
        icon: "🔧",
      },
      {
        label: "Completed",
        count: bookings.filter((b) => b.status === "Completed").length,
        color: "bg-green-100 text-green-700",
        icon: "✅",
      },
      {
        label: "Cancelled",
        count: bookings.filter((b) => b.status === "Cancelled").length,
        color: "bg-red-100 text-red-700",
        icon: "❌",
      },
    ].map((item) => (
      <div
        key={item.label}
        className="rounded-xl border border-slate-100 p-5 transition hover:shadow-md"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500">
            {item.label}
          </span>
          <span className={`rounded-lg px-3 py-2 text-xl ${item.color}`}>
            {item.icon}
          </span>
        </div>

        <p className="mt-4 text-3xl font-bold text-slate-900">
          {item.count}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Service bookings
        </p>
      </div>
    ))}
  </div>
</div>
{/* REVENUE SUMMARY */}
<div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
  <div className="mb-6">
    <h3 className="text-lg font-semibold text-slate-900">
      Revenue Summary
    </h3>
    <p className="mt-1 text-sm text-slate-500">
      Overview of invoice values and payment status
    </p>
  </div>

  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
    {[
      {
        label: "Total Invoiced",
        amount: invoices.reduce(
          (sum, invoice) => sum + Number(invoice.total_amount || 0),
          0
        ),
        icon: "💰",
        color: "bg-blue-100 text-blue-700",
      },
      {
        label: "Paid Invoice Value",
        amount: invoices
          .filter((invoice) => invoice.status === "Paid")
          .reduce(
            (sum, invoice) => sum + Number(invoice.total_amount || 0),
            0
          ),
        icon: "✅",
        color: "bg-green-100 text-green-700",
      },
      {
        label: "Unpaid / Partial Invoice Value",
        amount: invoices
          .filter((invoice) => invoice.status !== "Paid")
          .reduce(
            (sum, invoice) => sum + Number(invoice.total_amount || 0),
            0
          ),
        icon: "⏳",
        color: "bg-orange-100 text-orange-700",
      },
    ].map((item) => (
      <div
        key={item.label}
        className="rounded-xl border border-slate-100 p-5 transition hover:shadow-md"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500">
            {item.label}
          </span>
          <span className={`rounded-lg px-3 py-2 text-xl ${item.color}`}>
            {item.icon}
          </span>
        </div>

        <p className="mt-4 text-2xl font-bold text-slate-900">
          ₹{item.amount.toLocaleString("en-IN")}
        </p>
      </div>
    ))}
  </div>
</div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-6">
               <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
  <h3 className="text-lg font-semibold text-slate-900">
    Quick Actions
  </h3>

  <p className="mt-2 text-sm text-slate-500">
    Quickly access important service center operations.
  </p>

  <div className="mt-6 grid grid-cols-2 gap-4">
    {[
      { name: "Customers", icon: "👥", color: "bg-blue-100" },
      { name: "Vehicles", icon: "🚗", color: "bg-green-100" },
      { name: "Bookings", icon: "📅", color: "bg-purple-100" },
      { name: "Mechanics", icon: "🔧", color: "bg-orange-100" },
      { name: "Services", icon: "🛠️", color: "bg-pink-100" },
      { name: "Spare Parts", icon: "⚙️", color: "bg-yellow-100" },
      { name: "Invoices", icon: "🧾", color: "bg-indigo-100" },
      { name: "Repair History", icon: "📋", color: "bg-teal-100" },
    ].map((item) => (
      <button
        key={item.name}
        onClick={() => setActiveTab(item.name)}
        className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition-all duration-200 hover:-translate-y-1 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md"
      >
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${item.color}`}>
          {item.icon}
        </span>

        <span className="text-sm font-semibold text-slate-700">
          {item.name}
        </span>
      </button>
    ))}
  </div>
</div> 

            
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
  <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-blue-50" />

  <div className="relative">
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
        🧠
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          Smart Repair History
        </h3>
        <span className="text-xs font-medium text-blue-600">
          AI-Powered Semantic Search
        </span>
      </div>
    </div>

    <p className="mt-5 leading-6 text-slate-600">
      Find similar vehicle problems by searching previous repair
      descriptions. ChromaDB uses semantic similarity to retrieve
      relevant repair records.
    </p>

    <div className="mt-5 flex flex-wrap gap-2">
      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">
        ChromaDB
      </span>
      <span className="rounded-full bg-purple-50 px-3 py-1 text-xs text-purple-700">
        Vector Search
      </span>
      <span className="rounded-full bg-green-50 px-3 py-1 text-xs text-green-700">
        Repair Records
      </span>
    </div>

    <button
      onClick={() => setActiveTab("Repair History")}
      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
    >
      Explore Repair History
      <span>→</span>
    </button>
  </div>
</div> 

                
              </div>
            </div>
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
    <div>
      <h3 className="text-lg font-semibold text-slate-900">
        Recent Bookings
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        Latest vehicle service appointments
      </p>
    </div>

    <button
      onClick={() => setActiveTab("Bookings")}
      className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
    >
      View All
    </button>
  </div>

  {bookings.length === 0 ? (
    <p className="py-8 text-center text-slate-500">
      No bookings available yet.
    </p>
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-slate-50 text-slate-500">
          <tr>
            <th className="p-3">Booking ID</th>
            <th className="p-3">Customer</th>
            <th className="p-3">Vehicle</th>
            <th className="p-3">Booking Date</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>

        <tbody>
          {[...bookings]
            .sort(
              (a, b) =>
                new Date(b.booking_date).getTime() -
                new Date(a.booking_date).getTime()
            )
            .slice(0, 5)
            .map((booking) => (
              <tr
                key={booking.booking_id}
                className="border-b last:border-0 hover:bg-slate-50"
              >
                <td className="p-3 font-medium">
                  #{booking.booking_id}
                </td>

                <td className="p-3">
                  {booking.customer_name || "-"}
                </td>

                <td className="p-3">
                  {booking.registration_number || "-"}
                </td>

                <td className="p-3">
                  {String(booking.booking_date)
                    .replace("T", " ")
                    .slice(0, 16)}
                </td>

                <td className="p-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      booking.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : booking.status === "In Progress"
                        ? "bg-blue-100 text-blue-700"
                        : booking.status === "Cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {booking.status}
                  </span>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )}
</div>
            
              
          </>
        )}

        {/* CUSTOMERS */}
        {activeTab === "Customers" && (
          <div className="space-y-6">

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold">Add New Customer</h3>

              <form
                onSubmit={handleAddCustomer}
                className="mt-5 grid gap-4 sm:grid-cols-2"
              >
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  value={customerForm.full_name}
                  onChange={(e) =>
                    setCustomerForm({
                      ...customerForm,
                      full_name: e.target.value,
                    })
                  }
                  className="rounded-lg border border-slate-300 p-3"
                />

                <input
                  type="tel"
                  placeholder="Phone Number"
                  required
                  value={customerForm.phone}
                  onChange={(e) =>
                    setCustomerForm({
                      ...customerForm,
                      phone: e.target.value,
                    })
                  }
                  className="rounded-lg border border-slate-300 p-3"
                />

                <input
                  type="email"
                  placeholder="Email Address"
                  value={customerForm.email}
                  onChange={(e) =>
                    setCustomerForm({
                      ...customerForm,
                      email: e.target.value,
                    })
                  }
                  className="rounded-lg border border-slate-300 p-3"
                />

                <input
                  type="text"
                  placeholder="Address"
                  value={customerForm.address}
                  onChange={(e) =>
                    setCustomerForm({
                      ...customerForm,
                      address: e.target.value,
                    })
                  }
                  className="rounded-lg border border-slate-300 p-3"
                />

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50 sm:col-span-2"
                >
                  {saving ? "Saving..." : "Add Customer"}
                </button>
              </form>

              {message && (
                <p className="mt-4 text-sm text-green-700">{message}</p>
              )}

              {error && (
                <p className="mt-4 text-sm text-red-600">{error}</p>
              )}
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Customer Records</h3>

                <button
                  onClick={fetchCustomers}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100"
                >
                  Refresh
                </button>
              </div>

              {loading ? (
                <p className="py-6 text-slate-500">Loading customers...</p>
              ) : customers.length === 0 ? (
                <p className="py-6 text-slate-500">No customers found.</p>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-slate-50 text-slate-600">
                    <tr>
                      <th className="p-3">ID</th>
                      <th className="p-3">Name</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Address</th>
                    </tr>
                  </thead>

                  <tbody>
                    {customers.map((customer) => (
                      <tr
                        key={customer.customer_id}
                        className="border-b last:border-0 hover:bg-slate-50"
                      >
                        <td className="p-3">{customer.customer_id}</td>
                        <td className="p-3 font-medium">{customer.full_name}</td>
                        <td className="p-3">{customer.phone}</td>
                        <td className="p-3">{customer.email || "-"}</td>
                        <td className="p-3">{customer.address || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* VEHICLES */}
        {activeTab === "Vehicles" && (
          <div className="space-y-6">

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold">Register New Vehicle</h3>

              <form
                onSubmit={handleAddVehicle}
                className="mt-5 grid gap-4 sm:grid-cols-2"
              >
                <select
                  required
                  value={vehicleForm.customer_id}
                  onChange={(e) =>
                    setVehicleForm({
                      ...vehicleForm,
                      customer_id: e.target.value,
                    })
                  }
                  className="rounded-lg border border-slate-300 p-3"
                >
                  <option value="">Select Customer</option>
                  {customers.map((customer) => (
                    <option
                      key={customer.customer_id}
                      value={customer.customer_id}
                    >
                      {customer.full_name}
                    </option>
                  ))}
                </select>

                <input
                  required
                  placeholder="Registration Number"
                  value={vehicleForm.registration_number}
                  onChange={(e) =>
                    setVehicleForm({
                      ...vehicleForm,
                      registration_number: e.target.value.toUpperCase(),
                    })
                  }
                  className="rounded-lg border border-slate-300 p-3"
                />

                <input
                  required
                  placeholder="Brand"
                  value={vehicleForm.brand}
                  onChange={(e) =>
                    setVehicleForm({
                      ...vehicleForm,
                      brand: e.target.value,
                    })
                  }
                  className="rounded-lg border border-slate-300 p-3"
                />

                <input
                  required
                  placeholder="Model"
                  value={vehicleForm.model}
                  onChange={(e) =>
                    setVehicleForm({
                      ...vehicleForm,
                      model: e.target.value,
                    })
                  }
                  className="rounded-lg border border-slate-300 p-3"
                />

                <input
                  type="number"
                  placeholder="Manufacture Year"
                  min="1901"
                  max="2155"
                  value={vehicleForm.manufacture_year}
                  onChange={(e) =>
                    setVehicleForm({
                      ...vehicleForm,
                      manufacture_year: e.target.value,
                    })
                  }
                  className="rounded-lg border border-slate-300 p-3"
                />

                <select
                  value={vehicleForm.fuel_type}
                  onChange={(e) =>
                    setVehicleForm({
                      ...vehicleForm,
                      fuel_type: e.target.value,
                    })
                  }
                  className="rounded-lg border border-slate-300 p-3"
                >
                  <option value="">Select Fuel Type</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="CNG">CNG</option>
                </select>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50 sm:col-span-2"
                >
                  {saving ? "Saving..." : "Register Vehicle"}
                </button>
              </form>

              {message && (
                <p className="mt-4 text-sm text-green-700">{message}</p>
              )}

              {error && (
                <p className="mt-4 text-sm text-red-600">{error}</p>
              )}
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Registered Vehicles</h3>

                <button
                  onClick={fetchVehicles}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100"
                >
                  Refresh
                </button>
              </div>

              {loading ? (
                <p>Loading vehicles...</p>
              ) : vehicles.length === 0 ? (
                <p>No vehicles found.</p>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-slate-50 text-slate-600">
                    <tr>
                      <th className="p-3">ID</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Registration</th>
                      <th className="p-3">Brand</th>
                      <th className="p-3">Model</th>
                      <th className="p-3">Year</th>
                      <th className="p-3">Fuel</th>
                    </tr>
                  </thead>

                  <tbody>
                    {vehicles.map((vehicle) => (
                      <tr
                        key={vehicle.vehicle_id}
                        className="border-b hover:bg-slate-50"
                      >
                        <td className="p-3">{vehicle.vehicle_id}</td>
                        <td className="p-3">{vehicle.customer_name || vehicle.customer_id}</td>
                        <td className="p-3">{vehicle.registration_number}</td>
                        <td className="p-3">{vehicle.brand}</td>
                        <td className="p-3">{vehicle.model}</td>
                        <td className="p-3">{vehicle.manufacture_year || "-"}</td>
                        <td className="p-3">{vehicle.fuel_type || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
                {/* BOOKINGS */}
        {activeTab === "Bookings" && (
          <div className="space-y-6">

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold">Create New Booking</h3>

              <form
                onSubmit={handleAddBooking}
                className="mt-5 grid gap-4 sm:grid-cols-2"
              >
                <select
                  required
                  value={bookingForm.vehicle_id}
                  onChange={(e) =>
                    setBookingForm({
                      ...bookingForm,
                      vehicle_id: e.target.value,
                    })
                  }
                  className="rounded-lg border border-slate-300 p-3"
                >
                  <option value="">Select Vehicle</option>

                  {vehicles.map((vehicle) => (
                    <option
                      key={vehicle.vehicle_id}
                      value={vehicle.vehicle_id}
                    >
                      {vehicle.registration_number} - {vehicle.brand}{" "}
                      {vehicle.model}
                    </option>
                  ))}
                </select>

                <select
                  value={bookingForm.mechanic_id}
                  onChange={(e) =>
                    setBookingForm({
                      ...bookingForm,
                      mechanic_id: e.target.value,
                    })
                  }
                  className="rounded-lg border border-slate-300 p-3"
                >
                  <option value="">Select Mechanic (Optional)</option>

                  {mechanics.map((mechanic) => (
                    <option
                      key={mechanic.mechanic_id}
                      value={mechanic.mechanic_id}
                    >
                      {mechanic.full_name} -{" "}
                      {mechanic.specialization || "General"}
                    </option>
                  ))}
                </select>

                <input
                  type="datetime-local"
                  required
                  value={bookingForm.booking_date}
                  onChange={(e) =>
                    setBookingForm({
                      ...bookingForm,
                      booking_date: e.target.value,
                    })
                  }
                  className="rounded-lg border border-slate-300 p-3"
                />

                <textarea
                  required
                  placeholder="Describe the vehicle problem or customer complaint"
                  value={bookingForm.complaint}
                  onChange={(e) =>
                    setBookingForm({
                      ...bookingForm,
                      complaint: e.target.value,
                    })
                  }
                  className="rounded-lg border border-slate-300 p-3 sm:col-span-2"
                  rows={3}
                />

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50 sm:col-span-2"
                >
                  {saving ? "Saving..." : "Create Booking"}
                </button>
              </form>

              {message && (
                <p className="mt-4 text-sm text-green-700">{message}</p>
              )}

              {error && (
                <p className="mt-4 text-sm text-red-600">{error}</p>
              )}
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Service Bookings</h3>

                <button
                  onClick={fetchBookings}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100"
                >
                  Refresh
                </button>
              </div>

              {loading ? (
                <p className="py-6 text-slate-500">Loading bookings...</p>
              ) : bookings.length === 0 ? (
                <p className="py-6 text-slate-500">No bookings found.</p>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-slate-50 text-slate-600">
                    <tr>
                      <th className="p-3">ID</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Vehicle</th>
                      <th className="p-3">Mechanic</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Complaint</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {bookings.map((booking) => (
                      <tr
                        key={booking.booking_id}
                        className="border-b hover:bg-slate-50"
                      >
                        <td className="p-3">{booking.booking_id}</td>

                        <td className="p-3">{booking.customer_name}</td>

                        <td className="p-3">
                          {booking.registration_number}
                          <br />
                          {booking.brand} {booking.model}
                        </td>

                        <td className="p-3">
                          {booking.mechanic_name || "Not assigned"}
                        </td>

                        <td className="p-3">
                          {new Date(
                            booking.booking_date
                          ).toLocaleString()}
                        </td>

                        <td className="p-3">{booking.complaint}</td>

                        <td className="p-3">
                          <select
                            value={booking.status}
                            onChange={(e) =>
                              handleUpdateBookingStatus(
                                booking.booking_id,
                                e.target.value
                              )
                            }
                            className="rounded border border-slate-300 p-2"
                          >
                            <option value="Booked">Booked</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* MECHANICS */}
        {activeTab === "Mechanics" && (
          <div className="space-y-6">

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold">Add New Mechanic</h3>

              <form
                onSubmit={handleAddMechanic}
                className="mt-5 grid gap-4 sm:grid-cols-2"
              >
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  maxLength={100}
                  value={mechanicForm.full_name}
                  onChange={(e) =>
                    setMechanicForm({
                      ...mechanicForm,
                      full_name: e.target.value,
                    })
                  }
                  className="rounded-lg border border-slate-300 p-3"
                />

                <input
                  type="tel"
                  placeholder="Phone Number"
                  required
                  maxLength={15}
                  value={mechanicForm.phone}
                  onChange={(e) =>
                    setMechanicForm({
                      ...mechanicForm,
                      phone: e.target.value,
                    })
                  }
                  className="rounded-lg border border-slate-300 p-3"
                />

                <input
                  type="text"
                  placeholder="Specialization"
                  maxLength={100}
                  value={mechanicForm.specialization}
                  onChange={(e) =>
                    setMechanicForm({
                      ...mechanicForm,
                      specialization: e.target.value,
                    })
                  }
                  className="rounded-lg border border-slate-300 p-3"
                />

                <select
                  value={mechanicForm.availability}
                  onChange={(e) =>
                    setMechanicForm({
                      ...mechanicForm,
                      availability: e.target.value,
                    })
                  }
                  className="rounded-lg border border-slate-300 p-3"
                >
                  <option value="Available">Available</option>
                  <option value="Busy">Busy</option>
                  <option value="On Leave">On Leave</option>
                </select>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50 sm:col-span-2"
                >
                  {saving ? "Saving..." : "Add Mechanic"}
                </button>
              </form>

              {message && (
                <p className="mt-4 text-sm text-green-700">{message}</p>
              )}

              {error && (
                <p className="mt-4 text-sm text-red-600">{error}</p>
              )}
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Mechanic Records</h3>

                <button
                  onClick={fetchMechanics}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100"
                >
                  Refresh
                </button>
              </div>

              {loading ? (
                <p>Loading mechanics...</p>
              ) : mechanics.length === 0 ? (
                <p>No mechanics found.</p>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-slate-50 text-slate-600">
                    <tr>
                      <th className="p-3">ID</th>
                      <th className="p-3">Name</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Specialization</th>
                      <th className="p-3">Availability</th>
                    </tr>
                  </thead>

                  <tbody>
                    {mechanics.map((mechanic) => (
                      <tr
                        key={mechanic.mechanic_id}
                        className="border-b hover:bg-slate-50"
                      >
                        <td className="p-3">{mechanic.mechanic_id}</td>
                        <td className="p-3 font-medium">
                          {mechanic.full_name}
                        </td>
                        <td className="p-3">{mechanic.phone}</td>
                        <td className="p-3">
                          {mechanic.specialization || "-"}
                        </td>
                        <td className="p-3">
                          <select
                            value={mechanic.availability}
                            onChange={(e) =>
                              handleUpdateMechanicAvailability(
                                mechanic.mechanic_id,
                                e.target.value
                              )
                            }
                            className="rounded border border-slate-300 p-2"
                          >
                            <option value="Available">Available</option>
                            <option value="Busy">Busy</option>
                            <option value="On Leave">On Leave</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* SERVICES */}
        {activeTab === "Services" && (
          <div className="space-y-6">

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold">
                {editingServiceId ? "Edit Service" : "Add New Service"}
              </h3>

              <form
                onSubmit={handleSaveService}
                className="mt-5 grid gap-4 sm:grid-cols-2"
              >
                <input
                  type="text"
                  required
                  placeholder="Service Name"
                  value={serviceForm.service_name}
                  onChange={(e) =>
                    setServiceForm({
                      ...serviceForm,
                      service_name: e.target.value,
                    })
                  }
                  className="rounded-lg border border-slate-300 p-3"
                />

                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  placeholder="Base Price"
                  value={serviceForm.base_price}
                  onChange={(e) =>
                    setServiceForm({
                      ...serviceForm,
                      base_price: e.target.value,
                    })
                  }
                  className="rounded-lg border border-slate-300 p-3"
                />

                <textarea
                  placeholder="Service Description"
                  value={serviceForm.description}
                  onChange={(e) =>
                    setServiceForm({
                      ...serviceForm,
                      description: e.target.value,
                    })
                  }
                  className="rounded-lg border border-slate-300 p-3 sm:col-span-2"
                  rows={3}
                />

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingServiceId
                      ? "Update Service"
                      : "Add Service"}
                </button>

                {editingServiceId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingServiceId(null);
                      setServiceForm({
                        service_name: "",
                        description: "",
                        base_price: "",
                      });
                    }}
                    className="rounded-lg border border-slate-300 px-5 py-3 hover:bg-slate-100"
                  >
                    Cancel Edit
                  </button>
                )}
              </form>

              {message && (
                <p className="mt-4 text-sm text-green-700">{message}</p>
              )}

              {error && (
                <p className="mt-4 text-sm text-red-600">{error}</p>
              )}
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Available Services</h3>

                <button
                  onClick={fetchServices}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100"
                >
                  Refresh
                </button>
              </div>

              {loading ? (
                <p>Loading services...</p>
              ) : services.length === 0 ? (
                <p>No services found.</p>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-slate-50 text-slate-600">
                    <tr>
                      <th className="p-3">ID</th>
                      <th className="p-3">Service</th>
                      <th className="p-3">Description</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {services.map((service) => (
                      <tr
                        key={service.service_id}
                        className="border-b hover:bg-slate-50"
                      >
                        <td className="p-3">{service.service_id}</td>
                        <td className="p-3 font-medium">
                          {service.service_name}
                        </td>
                        <td className="p-3">
                          {service.description || "-"}
                        </td>
                        <td className="p-3">
                          ₹{Number(service.base_price).toFixed(2)}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditService(service)}
                              className="rounded bg-blue-100 px-3 py-2 text-blue-700 hover:bg-blue-200"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                handleDeleteService(service.service_id)
                              }
                              className="rounded bg-red-100 px-3 py-2 text-red-700 hover:bg-red-200"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* SPARE PARTS */}
        {activeTab === "Spare Parts" && (
          <div className="space-y-6">

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold">
                {editingPartId ? "Edit Spare Part" : "Add New Spare Part"}
              </h3>

              <form
                onSubmit={handleSaveSparePart}
                className="mt-5 grid gap-4 sm:grid-cols-2"
              >
                <input
                  type="text"
                  required
                  placeholder="Part Name"
                  value={sparePartForm.part_name}
                  onChange={(e) =>
                    setSparePartForm({
                      ...sparePartForm,
                      part_name: e.target.value,
                    })
                  }
                  className="rounded-lg border border-slate-300 p-3"
                />

                <input
                  type="text"
                  required
                  placeholder="Part Number"
                  value={sparePartForm.part_number}
                  onChange={(e) =>
                    setSparePartForm({
                      ...sparePartForm,
                      part_number: e.target.value,
                    })
                  }
                  className="rounded-lg border border-slate-300 p-3"
                />

                <input
                  type="number"
                  required
                  min="0"
                  placeholder="Stock Quantity"
                  value={sparePartForm.stock_quantity}
                  onChange={(e) =>
                    setSparePartForm({
                      ...sparePartForm,
                      stock_quantity: e.target.value,
                    })
                  }
                  className="rounded-lg border border-slate-300 p-3"
                />

                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  placeholder="Unit Price"
                  value={sparePartForm.unit_price}
                  onChange={(e) =>
                    setSparePartForm({
                      ...sparePartForm,
                      unit_price: e.target.value,
                    })
                  }
                  className="rounded-lg border border-slate-300 p-3"
                />

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingPartId
                      ? "Update Spare Part"
                      : "Add Spare Part"}
                </button>

                {editingPartId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPartId(null);
                      setSparePartForm({
                        part_name: "",
                        part_number: "",
                        stock_quantity: "0",
                        unit_price: "",
                      });
                    }}
                    className="rounded-lg border border-slate-300 px-5 py-3 hover:bg-slate-100"
                  >
                    Cancel Edit
                  </button>
                )}
              </form>

              {message && (
                <p className="mt-4 text-sm text-green-700">{message}</p>
              )}

              {error && (
                <p className="mt-4 text-sm text-red-600">{error}</p>
              )}
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Spare Parts Inventory</h3>

                <button
                  onClick={fetchSpareParts}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100"
                >
                  Refresh
                </button>
              </div>

              {loading ? (
                <p>Loading spare parts...</p>
              ) : spareParts.length === 0 ? (
                <p>No spare parts found.</p>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-slate-50 text-slate-600">
                    <tr>
                      <th className="p-3">ID</th>
                      <th className="p-3">Part Name</th>
                      <th className="p-3">Part Number</th>
                      <th className="p-3">Stock</th>
                      <th className="p-3">Unit Price</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {spareParts.map((part) => (
                      <tr
                        key={part.part_id}
                        className="border-b hover:bg-slate-50"
                      >
                        <td className="p-3">{part.part_id}</td>
                        <td className="p-3 font-medium">{part.part_name}</td>
                        <td className="p-3">{part.part_number}</td>
                        <td className="p-3">
                          <span
                            className={
                              part.stock_quantity <= 5
                                ? "font-semibold text-red-600"
                                : "text-slate-700"
                            }
                          >
                            {part.stock_quantity}
                          </span>
                        </td>
                        <td className="p-3">
                          ₹{Number(part.unit_price).toFixed(2)}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditSparePart(part)}
                              className="rounded bg-blue-100 px-3 py-2 text-blue-700 hover:bg-blue-200"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                handleDeleteSparePart(part.part_id)
                              }
                              className="rounded bg-red-100 px-3 py-2 text-red-700 hover:bg-red-200"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
                {/* INVOICES */}
        {activeTab === "Invoices" && (
          <div className="space-y-6">

            {/* CREATE / EDIT INVOICE */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold">
                {editingInvoiceId ? "Edit Invoice" : "Create New Invoice"}
              </h3>

              <form
                onSubmit={handleSaveInvoice}
                className="mt-5 grid gap-4 sm:grid-cols-2"
              >
                <select
                  required
                  disabled={!!editingInvoiceId}
                  value={invoiceForm.booking_id}
                  onChange={(e) =>
                    setInvoiceForm({
                      ...invoiceForm,
                      booking_id: e.target.value,
                    })
                  }
                  className="rounded-lg border border-slate-300 p-3"
                >
                  <option value="">Select Booking</option>

                  {bookings.map((booking) => (
                    <option
                      key={booking.booking_id}
                      value={booking.booking_id}
                    >
                      Booking #{booking.booking_id} -{" "}
                      {booking.registration_number} -{" "}
                      {booking.customer_name}
                    </option>
                  ))}
                </select>

                <input
                  type="date"
                  required
                  value={invoiceForm.invoice_date}
                  onChange={(e) =>
                    setInvoiceForm({
                      ...invoiceForm,
                      invoice_date: e.target.value,
                    })
                  }
                  className="rounded-lg border border-slate-300 p-3"
                />

                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  placeholder="Total Amount"
                  value={invoiceForm.total_amount}
                  onChange={(e) =>
                    setInvoiceForm({
                      ...invoiceForm,
                      total_amount: e.target.value,
                    })
                  }
                  className="rounded-lg border border-slate-300 p-3"
                />

                <select
                  value={invoiceForm.status}
                  onChange={(e) =>
                    setInvoiceForm({
                      ...invoiceForm,
                      status: e.target.value,
                    })
                  }
                  className="rounded-lg border border-slate-300 p-3"
                >
                  <option value="Unpaid">Unpaid</option>
                  <option value="Partial Paid">Partial Paid</option>
                  <option value="Paid">Paid</option>
                </select>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingInvoiceId
                      ? "Update Invoice"
                      : "Create Invoice"}
                </button>

                {editingInvoiceId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingInvoiceId(null);
                      setInvoiceForm({
                        booking_id: "",
                        invoice_date: new Date()
                          .toISOString()
                          .split("T")[0],
                        total_amount: "",
                        status: "Unpaid",
                      });
                    }}
                    className="rounded-lg border border-slate-300 px-5 py-3 hover:bg-slate-100"
                  >
                    Cancel Edit
                  </button>
                )}
              </form>

              {message && (
                <p className="mt-4 text-sm text-green-700">{message}</p>
              )}

              {error && (
                <p className="mt-4 text-sm text-red-600">{error}</p>
              )}
            </div>
                        {/* INVOICE RECORDS */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Invoice Records</h3>

                <button
                  onClick={fetchInvoices}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100"
                >
                  Refresh
                </button>
              </div>

              {loading ? (
                <p>Loading invoices...</p>
              ) : invoices.length === 0 ? (
                <p className="py-6 text-slate-500">
                  No invoices found. Create an invoice using the form above.
                </p>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-slate-50 text-slate-600">
                    <tr>
                      <th className="p-3">Invoice ID</th>
                      <th className="p-3">Booking ID</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Vehicle</th>
                      <th className="p-3">Invoice Date</th>
                      <th className="p-3">Total Amount</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {invoices.map((invoice) => (
                      <tr
                        key={invoice.invoice_id}
                        className="border-b hover:bg-slate-50"
                      >
                        <td className="p-3 font-medium">
                          #{invoice.invoice_id}
                        </td>

                        <td className="p-3">
                          #{invoice.booking_id}
                        </td>

                        <td className="p-3">
                          {invoice.customer_name || "-"}
                        </td>

                        <td className="p-3">
                          {invoice.registration_number || "-"}
                        </td>

                        <td className="p-3">
                          {invoice.invoice_date
                            ? new Date(
                                invoice.invoice_date
                              ).toLocaleDateString()
                            : "-"}
                        </td>

                        <td className="p-3 font-medium">
                          ₹{Number(invoice.total_amount).toFixed(2)}
                        </td>

                        <td className="p-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              invoice.status === "Paid"
                                ? "bg-green-100 text-green-700"
                                : invoice.status === "Partial Paid"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {invoice.status}
                          </span>
                        </td>

                        <td className="p-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditInvoice(invoice)}
                              className="rounded bg-blue-100 px-3 py-2 text-blue-700 hover:bg-blue-200"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                handleDeleteInvoice(invoice.invoice_id)
                              }
                              className="rounded bg-red-100 px-3 py-2 text-red-700 hover:bg-red-200"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* REPAIR HISTORY */}
        {activeTab === "Repair History" && (
          <div className="space-y-6">

            {/* ADD REPAIR RECORD */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold">
                Add Repair History
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Store previous repair information in ChromaDB for future
                semantic searches.
              </p>

              <form
                onSubmit={handleSaveRepair}
                className="mt-5 grid gap-4 sm:grid-cols-2"
              >
                <input
                  type="text"
                  required
                  placeholder="Repair ID (Example: R002)"
                  value={repairForm.repair_id}
                  onChange={(e) =>
                    setRepairForm({
                      ...repairForm,
                      repair_id: e.target.value,
                    })
                  }
                  className="rounded-lg border border-slate-300 p-3"
                />

                <input
                  type="text"
                  required
                  placeholder="Vehicle Registration Number"
                  value={repairForm.vehicle_number}
                  onChange={(e) =>
                    setRepairForm({
                      ...repairForm,
                      vehicle_number: e.target.value.toUpperCase(),
                    })
                  }
                  className="rounded-lg border border-slate-300 p-3"
                />

                <input
                  type="text"
                  required
                  placeholder="Repair Type (Example: Engine Repair)"
                  value={repairForm.repair_type}
                  onChange={(e) =>
                    setRepairForm({
                      ...repairForm,
                      repair_type: e.target.value,
                    })
                  }
                  className="rounded-lg border border-slate-300 p-3 sm:col-span-2"
                />

                <textarea
                  required
                  placeholder="Describe the repair performed and the vehicle problem"
                  value={repairForm.description}
                  onChange={(e) =>
                    setRepairForm({
                      ...repairForm,
                      description: e.target.value,
                    })
                  }
                  className="rounded-lg border border-slate-300 p-3 sm:col-span-2"
                  rows={4}
                />

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50 sm:col-span-2"
                >
                  {saving ? "Saving..." : "Save Repair History"}
                </button>
              </form>

              {message && (
                <p className="mt-4 text-sm text-green-700">{message}</p>
              )}

              {error && (
                <p className="mt-4 text-sm text-red-600">{error}</p>
              )}
            </div>
                        {/* SEMANTIC REPAIR SEARCH */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold">
                Find Similar Repair Records
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Enter a vehicle complaint. ChromaDB will search for
                previously stored repairs with similar descriptions.
              </p>

              <form
                onSubmit={handleSearchRepairs}
                className="mt-5 space-y-4"
              >
                <textarea
                  required
                  placeholder="Example: Vehicle engine is getting too hot"
                  value={repairSearch.complaint}
                  onChange={(e) =>
                    setRepairSearch({
                      ...repairSearch,
                      complaint: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 p-3"
                  rows={3}
                />

                <div className="flex flex-wrap items-center gap-4">
                  <select
                    value={repairSearch.results}
                    onChange={(e) =>
                      setRepairSearch({
                        ...repairSearch,
                        results: e.target.value,
                      })
                    }
                    className="rounded-lg border border-slate-300 p-3"
                  >
                    <option value="1">1 Result</option>
                    <option value="3">3 Results</option>
                    <option value="5">5 Results</option>
                    <option value="10">10 Results</option>
                  </select>

                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? "Searching..." : "Search Similar Repairs"}
                  </button>
                </div>
              </form>

              {error && (
                <p className="mt-4 text-sm text-red-600">{error}</p>
              )}

              {message && (
                <p className="mt-4 text-sm text-green-700">{message}</p>
              )}

              {/* SEARCH RESULTS */}
              {repairResults.length > 0 && (
                <div className="mt-8">
                  <h4 className="mb-4 text-lg font-semibold">
                    Similar Repair Results
                  </h4>

                  <div className="space-y-4">
                    {repairResults.map((result) => (
                      <div
                        key={result.repair_id}
                        className="rounded-lg border border-slate-200 p-5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <h5 className="font-semibold">
                            Repair ID: {result.repair_id}
                          </h5>

                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                            Distance:{" "}
                            {typeof result.distance === "number"
                              ? result.distance.toFixed(4)
                              : result.distance}
                          </span>
                        </div>

                        <p className="mt-3 text-sm text-slate-700">
                          {result.description}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
                          <span>
                            Vehicle:{" "}
                            {result.metadata?.vehicle_number || "-"}
                          </span>

                          <span>
                            Repair Type:{" "}
                            {result.metadata?.repair_type || "-"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}