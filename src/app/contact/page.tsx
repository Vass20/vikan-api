"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, MapPin, Phone, Clock, ShieldCheck, Send } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useSubmitSupportTicketMutation } from "@/lib/redux/api";

export default function ContactSupportPage() {
  const { addNotification, showToast } = useAppStore();
  const [submitSupportTicket] = useSubmitSupportTicketMutation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) return;
    
    setIsSubmitting(true);
    try {
      const res = await submitSupportTicket({
        name,
        email,
        subject,
        message
      }).unwrap();
      
      setTicketId(res.ticketNumber);
      setIsSubmitted(true);
  
      addNotification({
        title: "Support Ticket Registered",
        body: `Your ticket ${res.ticketNumber} has been submitted successfully. Support will contact you shortly.`,
        type: "system"
      });
    } catch (err: any) {
      console.error(err);
      showToast(err?.data?.message || "Failed to submit support ticket.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="flex-1 bg-[#F7F3EE] dark:bg-[#081626] py-16 px-4 sm:px-6 lg:px-8 text-foreground">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="font-support text-xs font-bold text-brand-gold uppercase tracking-widest block mb-2">
              Assistance & Support
            </span>
            <h1 className="font-serif text-3xl md:text-5xl font-bold text-brand-navy dark:text-foreground">
              Contact Vikan Helpdesk
            </h1>
            <p className="text-xs text-muted-foreground font-support mt-2 max-w-md mx-auto">
              Our priority assistance team is available 24/7 to resolve billing, membership, or verification queries.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left side: Information */}
            <div className="lg:col-span-5 space-y-8">
              <div className="bg-card border border-border/80 rounded-2xl p-8 shadow-sm space-y-6">
                <h3 className="font-serif text-lg font-bold text-brand-navy dark:text-foreground border-b border-border/40 pb-3">
                  Corporate Directory
                </h3>

                {/* Email block */}
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-brand-gold/10 text-brand-gold shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-semibold">Priority Email</h4>
                    <a href="mailto:vikanmatrimony@gmail.com" className="text-xs text-muted-foreground hover:text-brand-gold font-support transition-colors block mt-1">
                      vikanmatrimony@gmail.com
                    </a>
                  </div>
                </div>

                {/* Address block */}
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-brand-gold/10 text-brand-gold shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-semibold">Corporate Head Office</h4>
                    <p className="text-xs text-muted-foreground font-support leading-relaxed mt-1">
                      36 E, C Block,<br />
                      Srikrishna Nagar, Chidambaram Main Road,<br />
                      Jayankondam, Udayarpalayam Taluk,<br />
                      Ariyalur District - 621802
                    </p>
                  </div>
                </div>

                {/* Phone block */}
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-brand-gold/10 text-brand-gold shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-semibold">Concierge Support Line</h4>
                    <p className="text-xs text-muted-foreground font-support mt-1">
                      +91 22 6902 4444 (Paid Members Line)
                    </p>
                  </div>
                </div>

                {/* Time block */}
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-brand-gold/10 text-brand-gold shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-semibold">Response Standards</h4>
                    <p className="text-xs text-muted-foreground font-support mt-1">
                      24 Hours Support turnaround time.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Contact Form */}
            <div className="lg:col-span-7">
              <div className="bg-card border border-border/80 rounded-2xl p-8 shadow-sm">
                {isSubmitted ? (
                  <div className="text-center p-8 bg-emerald-500/5 border border-emerald-500/30 rounded-2xl flex flex-col items-center justify-center space-y-4">
                    <div className="p-3 bg-emerald-500 text-white rounded-full">
                      <ShieldCheck className="h-10 w-10" />
                    </div>
                    <h3 className="font-serif text-lg font-bold text-emerald-600">Ticket Submitted Successfully</h3>
                    <p className="text-xs text-muted-foreground font-support max-w-md leading-relaxed">
                      Thank you for contacting support. Your ticket ID is <strong className="font-mono text-[#F44336] dark:text-[#E91E63]">{ticketId}</strong>. A support executive has been assigned and will reply to your registered email address shortly.
                    </p>
                    <Button type="button" variant="outline" size="sm" onClick={() => {
                      setIsSubmitted(false);
                      setName("");
                      setEmail("");
                      setSubject("");
                      setMessage("");
                    }} className="mt-4">
                      Submit Another Ticket
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6 font-support text-xs">
                    <h3 className="font-serif text-base font-bold text-brand-navy dark:text-foreground border-b border-border/40 pb-3 flex items-center gap-2">
                      Submit a Helpdesk Request
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Your Full Name"
                        placeholder="Enter name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                      <Input
                        label="Email Address"
                        placeholder="email@example.com"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <Input
                      label="Subject"
                      placeholder="What can we help you with?"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                    />

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground block">
                        Detail Message
                      </label>
                      <textarea
                        rows={5}
                        placeholder="Provide details about your support request..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full px-4 py-3 border border-border/80 focus:border-brand-gold/60 focus:ring-1 focus:ring-brand-gold/30 rounded-xl bg-[#081322]/10 dark:bg-[#081322]/40 outline-none text-foreground text-xs leading-relaxed"
                        required
                      />
                    </div>

                    <Button type="submit" variant="secondary" className="w-full uppercase font-bold tracking-wider py-3 flex items-center justify-center gap-2" isLoading={isSubmitting}>
                      <Send className="h-4 w-4" /> Submit Support Ticket
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
