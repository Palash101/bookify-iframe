'use client'

import { useState } from 'react'
import type { ClassDetailsType, Seat, UserDetails } from './booking-widget'

interface BookingFormProps {
  classDetails: ClassDetailsType
  seat: Seat
  onSubmit: (user: UserDetails) => void
  onBack: () => void
}

export function BookingForm({ classDetails, seat, onSubmit, onBack }: BookingFormProps) {
  const [formData, setFormData] = useState<UserDetails>({
    name: '',
    email: '',
    phone: ''
  })
  const [errors, setErrors] = useState<Partial<UserDetails>>({})

  const validate = () => {
    const newErrors: Partial<UserDetails> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required'
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Invalid phone number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(formData)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name as keyof UserDetails]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Complete Your Booking</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your details to book this class
        </p>
      </div>

      {/* Booking Summary */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-medium text-muted-foreground">Booking Summary</h3>
        
        <div className="mt-4 flex gap-4">
          <img
            src={classDetails.image}
            alt={classDetails.name}
            className="h-20 w-20 rounded-lg object-cover"
            crossOrigin="anonymous"
          />
          <div className="flex-1">
            <h4 className="font-semibold text-card-foreground">{classDetails.name}</h4>
            <p className="text-sm text-muted-foreground">with {classDetails.instructor}</p>
            <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
              <span>{classDetails.time}</span>
              <span>{classDetails.duration}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-lg bg-secondary/50 p-3">
          <span className="text-sm text-muted-foreground">Selected Seat</span>
          <span className="rounded-lg bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">
            {seat.label}
          </span>
        </div>
      </div>

      {/* User Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-4 text-sm font-medium text-muted-foreground">Your Information</h3>

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-card-foreground">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className={`mt-1 w-full rounded-lg border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.name ? 'border-destructive' : 'border-input'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-card-foreground">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className={`mt-1 w-full rounded-lg border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.email ? 'border-destructive' : 'border-input'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-card-foreground">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                className={`mt-1 w-full rounded-lg border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.phone ? 'border-destructive' : 'border-input'
                }`}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-destructive">{errors.phone}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 rounded-lg border border-border bg-secondary px-6 py-3 font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            Back
          </button>
          <button
            type="submit"
            className="flex-1 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Confirm Booking
          </button>
        </div>
      </form>
    </div>
  )
}
