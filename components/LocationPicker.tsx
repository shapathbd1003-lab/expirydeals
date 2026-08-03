'use client'
import { useState, useEffect } from 'react'
import { BD_LOCATIONS, getDistricts } from '@/lib/bd-locations'
import { useLang } from '@/hooks/useLang'

interface LocationValue {
  division: string
  district: string
  address: string
}

interface Props {
  value: LocationValue
  onChange: (val: LocationValue) => void
}

const T = {
  en: {
    division: 'Division', selectDivision: 'Select Division',
    district: 'District', selectDistrict: 'Select District',
    fullAddress: 'Full Address', optional: '(optional)',
    addressPlaceholder: 'e.g. House 12, Road 5, Mirpur DOHS — include area/landmark for easy pickup',
  },
  bn: {
    division: 'বিভাগ', selectDivision: 'বিভাগ নির্বাচন করুন',
    district: 'জেলা', selectDistrict: 'জেলা নির্বাচন করুন',
    fullAddress: 'সম্পূর্ণ ঠিকানা', optional: '(ঐচ্ছিক)',
    addressPlaceholder: 'যেমন: বাড়ি ১২, রোড ৫, মিরপুর ডিওএইচএস — সহজে পিকআপের জন্য এলাকা/ল্যান্ডমার্ক উল্লেখ করুন',
  },
}

export function LocationPicker({ value, onChange }: Props) {
  const { lang } = useLang()
  const t = T[lang]
  const [districts, setDistricts] = useState<string[]>([])

  useEffect(() => {
    setDistricts(value.division ? getDistricts(value.division) : [])
  }, [value.division])

  const set = (key: keyof LocationValue, val: string) => {
    const next = { ...value, [key]: val }
    if (key === 'division') { next.district = '' }
    onChange(next)
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Division */}
        <div>
          <label className="label">{t.division} <span className="text-red-500">*</span></label>
          <select className="input" required value={value.division} onChange={e => set('division', e.target.value)}>
            <option value="">{t.selectDivision}</option>
            {BD_LOCATIONS.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
          </select>
        </div>

        {/* District */}
        <div>
          <label className="label">{t.district} <span className="text-red-500">*</span></label>
          <select className="input" required value={value.district} onChange={e => set('district', e.target.value)} disabled={!value.division}>
            <option value="">{t.selectDistrict}</option>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* Full address */}
      <div>
        <label className="label">{t.fullAddress} <span className="text-gray-400 font-normal">{t.optional}</span></label>
        <input
          className="input"
          placeholder={t.addressPlaceholder}
          value={value.address}
          onChange={e => set('address', e.target.value)}
        />
      </div>
    </div>
  )
}
