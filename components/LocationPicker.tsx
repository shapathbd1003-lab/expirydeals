'use client'
import { useState, useEffect } from 'react'
import { BD_LOCATIONS, getDistricts, getUpazilas } from '@/lib/bd-locations'

interface LocationValue {
  division: string
  district: string
  upazila: string
  address: string
}

interface Props {
  value: LocationValue
  onChange: (val: LocationValue) => void
}

export function LocationPicker({ value, onChange }: Props) {
  const [districts, setDistricts] = useState<string[]>([])
  const [upazilas, setUpazilas] = useState<string[]>([])

  useEffect(() => {
    setDistricts(value.division ? getDistricts(value.division) : [])
    setUpazilas(value.district ? getUpazilas(value.division, value.district) : [])
  }, [value.division, value.district])

  const set = (key: keyof LocationValue, val: string) => {
    const next = { ...value, [key]: val }
    if (key === 'division') { next.district = ''; next.upazila = '' }
    if (key === 'district') { next.upazila = '' }
    onChange(next)
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Division */}
        <div>
          <label className="label">Division <span className="text-red-500">*</span></label>
          <select className="input" required value={value.division} onChange={e => set('division', e.target.value)}>
            <option value="">Select Division</option>
            {BD_LOCATIONS.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
          </select>
        </div>

        {/* District */}
        <div>
          <label className="label">District <span className="text-red-500">*</span></label>
          <select className="input" required value={value.district} onChange={e => set('district', e.target.value)} disabled={!value.division}>
            <option value="">Select District</option>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Upazila */}
        <div>
          <label className="label">Upazila / Thana</label>
          <select className="input" value={value.upazila} onChange={e => set('upazila', e.target.value)} disabled={!value.district}>
            <option value="">Select Upazila</option>
            {upazilas.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>

      {/* Full address */}
      <div>
        <label className="label">Full Address <span className="text-gray-400 font-normal">(optional)</span></label>
        <input
          className="input"
          placeholder="e.g. House 12, Road 5, Mirpur DOHS"
          value={value.address}
          onChange={e => set('address', e.target.value)}
        />
      </div>
    </div>
  )
}
