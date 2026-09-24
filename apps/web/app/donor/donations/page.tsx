'use client';

import React, { useState, useEffect } from 'react';
import {
  PackageCheck,
  Search,
  Filter,
  Download,
  ExternalLink,
  PlusCircle,
  Truck,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { UrgencyBadge, UrgencyLevel } from '../../../components/donor/UrgencyBadge';

export default function MyDonationsPage() {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [donations, setDonations] = useState<any[]>([]);

  useEffect(() => {
    // Load historical donations
    setDonations([
      {
        id: 'don-201',
        title: 'Prepared Dal Makhani & Jeera Rice',
        category: 'Prepared Meals',
        quantity_kg: 30.0,
        created: 'Today, 2:30 PM',
        deadline: '6:30 PM',
        receiver: 'Delhi Roti Bank Foundation',
        driver: 'Rahul Sharma (Van)',
        status: 'IN_TRANSIT',
        urgency: 'URGENT',
      },
      {
        id: 'don-202',
        title: 'Paneer Curry & Roti Meal Trays',
        category: 'Packaged Food',
        quantity_kg: 40.0,
        created: 'Today, 1:45 PM',
        deadline: '7:45 PM',
        receiver: 'Asha Deep Shelter Home',
        driver: 'Amit Singh (Van)',
        status: 'MATCHED',
        urgency: 'WARNING',
      },
      {
        id: 'don-198',
        title: 'Assorted Sandwich Trays & Bakery Buns',
        category: 'Bakery & Bread',
        quantity_kg: 22.0,
        created: 'Yesterday, 8:00 PM',
        deadline: 'Yesterday, 11:30 PM',
        receiver: 'Robin Food Relief Collective',
        driver: 'Pooja Sharma (Scooter)',
        status: 'DELIVERED',
        urgency: 'SAFE',
      },
      {
        id: 'don-195',
        title: 'Vegetable Biryani & Raita (Banquet Excess)',
        category: 'Prepared Meals',
        quantity_kg: 55.0,
        created: '22 Sep 2026',
        deadline: '22 Sep 2026',
        receiver: 'Kashmere Gate Community Kitchen',
        driver: 'Rajesh Kumar (Truck)',
        status: 'DELIVERED',
        urgency: 'SAFE',
      },
      {
        id: 'don-190',
        title: 'Fresh Fruit Crates (Apples & Bananas)',
        category: 'Produce',
        quantity_kg: 35.0,
        created: '19 Sep 2026',
        deadline: '20 Sep 2026',
        receiver: 'Asha Deep Shelter Home',
        driver: 'Sunil Verma',
        status: 'DELIVERED',
        urgency: 'SAFE',
      },
      {
        id: 'don-184',
        title: 'Cooked Mixed Lentil Soup',
        category: 'Prepared Meals',
        quantity_kg: 18.0,
        created: '15 Sep 2026',
        deadline: '15 Sep 2026',
        receiver: 'Unmatched in window',
        driver: '—',
        status: 'EXPIRED',
        urgency: 'SAFE',
      },
    ]);
  }, []);

  const filtered = donations.filter((item) => {
    const matchesStatus =
      filterStatus === 'ALL' || item.status.toUpperCase() === filterStatus;
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.receiver.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5dec9] dark:border-[#2d3239] pb-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
            My Surplus Food Donations
          </h1>
          <p className="text-xs text-[#5c6068]">
            Full historical audit ledger of declared surplus, receiver allocations, and handoff certificates
          </p>
        </div>

        <a
          href="/donor/donations/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1f4d36] hover:bg-[#163827] text-white text-xs font-bold shadow-xs transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post Surplus Food</span>
        </a>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#1c2024] p-4 rounded-2xl border border-[#e5dec9] dark:border-[#2d3239] shadow-xs">
        
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs font-semibold">
          {['ALL', 'IN_TRANSIT', 'MATCHED', 'DELIVERED', 'EXPIRED'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
                filterStatus === s
                  ? 'bg-[#1f4d36] text-white font-bold'
                  : 'text-[#5c6068] hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#5c6068] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by ID, food, or shelter..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#e5dec9] dark:border-[#2d3239] bg-transparent text-xs focus:outline-none focus:ring-2 focus:ring-[#1f4d36]"
          />
        </div>
      </div>

      {/* Donations List / Table */}
      <div className="bg-white dark:bg-[#1c2024] rounded-3xl border border-[#e5dec9] dark:border-[#2d3239] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-[#5c6068] uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Donation ID</th>
                <th className="py-3 px-4">Food & Category</th>
                <th className="py-3 px-4">Net Quantity</th>
                <th className="py-3 px-4">Created Time</th>
                <th className="py-3 px-4">Deadline</th>
                <th className="py-3 px-4">Receiver Partner</th>
                <th className="py-3 px-4">Driver Handoff</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#1f4d36] dark:text-[#4f9d3a]">
                    {item.id}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-[#23262b] dark:text-[#f7f1e3] block">{item.title}</span>
                    <span className="text-[10px] text-[#5c6068]">{item.category}</span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-sm text-[#23262b] dark:text-[#f7f1e3]">
                    {item.quantity_kg} kg
                  </td>
                  <td className="py-3.5 px-4 text-[#5c6068]">{item.created}</td>
                  <td className="py-3.5 px-4 text-[#23262b] dark:text-[#f7f1e3]">{item.deadline}</td>
                  <td className="py-3.5 px-4 font-semibold text-[#1f4d36] dark:text-[#4f9d3a]">
                    {item.receiver}
                  </td>
                  <td className="py-3.5 px-4 text-[#5c6068]">{item.driver}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        item.status === 'DELIVERED'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : item.status === 'IN_TRANSIT'
                          ? 'bg-orange-50 text-orange-800 border border-orange-200 animate-pulse'
                          : item.status === 'MATCHED'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                    <a
                      href={`/donor/donations/${item.id}`}
                      className="px-2.5 py-1 rounded-lg border border-[#e5dec9] text-[11px] font-semibold text-[#1f4d36] hover:bg-[#f7f1e3]"
                    >
                      View
                    </a>
                    {item.status === 'IN_TRANSIT' && (
                      <a
                        href={`/donor/rescues/${item.id}`}
                        className="px-2.5 py-1 rounded-lg bg-[#e0662b] text-white text-[11px] font-semibold hover:bg-[#c9531d]"
                      >
                        Track
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
