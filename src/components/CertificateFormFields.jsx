/**
 * Pure presentational component — holds no state of its own.
 * ApplicationForm owns the actual form state and passes it down,
 * which keeps this component reusable and easy to test in isolation.
 */
export default function CertificateFormFields({ values, onChange }) {
  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        Full name
        <input
          type="text"
          required
          value={values.name}
          onChange={(e) => onChange({ ...values, name: e.target.value })}
          className="border rounded-lg p-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Date of birth
        <input
          type="date"
          required
          value={values.dob}
          onChange={(e) => onChange({ ...values, dob: e.target.value })}
          className="border rounded-lg p-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Place of birth
        <input
          type="text"
          required
          value={values.placeOfBirth}
          onChange={(e) => onChange({ ...values, placeOfBirth: e.target.value })}
          className="border rounded-lg p-2"
        />
      </label>
    </div>
  );
}
