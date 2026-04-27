import {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const INITIAL = {
    username: '', email: '', first_name: '', last_name: '',
    student_id: '', department: '', university: '',
    phone: '', password: '', password2: '',
};

const Register = () => {
    const {register} = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState(INITIAL);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const handleChange = e => {
        setForm(p => ({...p, [e.target.name]: e.target.value}));
        if (errors[e.target.name]) setErrors(p => ({...p, [e.target.name]: null}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setSubmitting(true);
        const result = await register(form);
        if (result.success) navigate('/dashboard');
        else setErrors(result.errors || {});
        setSubmitting(false);
    };

    const fieldErr = (name) =>
        errors[name] ?
            <p className="text-red-500 text-xs mt-1">{Array.isArray(errors[name]) ? errors[name][0] : errors[name]}</p> : null;

    const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm";
    const labelClass = "block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5";

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-xl">
                <div className="text-center mb-8">
                    <div className="text-4xl mb-3">🎓</div>
                    <h1 className="text-2xl font-black text-gray-900">Join Campusor</h1>
                    <p className="text-gray-500 mt-1">Create your student account</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
                    {errors.error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-5">
                            {errors.error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>First Name *</label>
                                <input name="first_name" required value={form.first_name} onChange={handleChange}
                                       className={inputClass}/>
                                {fieldErr('first_name')}
                            </div>
                            <div>
                                <label className={labelClass}>Last Name *</label>
                                <input name="last_name" required value={form.last_name} onChange={handleChange}
                                       className={inputClass}/>
                                {fieldErr('last_name')}
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Username *</label>
                            <input name="username" required value={form.username} onChange={handleChange}
                                   className={inputClass} placeholder="min 4 characters"/>
                            {fieldErr('username')}
                        </div>

                        <div>
                            <label className={labelClass}>Email *</label>
                            <input type="email" name="email" required value={form.email} onChange={handleChange}
                                   className={inputClass} placeholder="your@university.edu"/>
                            {fieldErr('email')}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Student ID</label>
                                <input name="student_id" value={form.student_id} onChange={handleChange}
                                       className={inputClass}/>
                            </div>
                            <div>
                                <label className={labelClass}>Phone</label>
                                <input name="phone" value={form.phone} onChange={handleChange} className={inputClass}
                                       placeholder="01XXXXXXXXX"/>
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>University</label>
                            <input name="university" value={form.university} onChange={handleChange}
                                   className={inputClass} placeholder="e.g. United International University"/>
                        </div>

                        <div>
                            <label className={labelClass}>Department</label>
                            <input name="department" value={form.department} onChange={handleChange}
                                   className={inputClass} placeholder="e.g. Computer Science and Engineering"/>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Password *</label>
                                <input type="password" name="password" required value={form.password}
                                       onChange={handleChange} className={inputClass}/>
                                {fieldErr('password')}
                            </div>
                            <div>
                                <label className={labelClass}>Confirm Password *</label>
                                <input type="password" name="password2" required value={form.password2}
                                       onChange={handleChange} className={inputClass}/>
                                {fieldErr('password2')}
                            </div>
                        </div>

                        <button type="submit" disabled={submitting}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors mt-2">
                            {submitting ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-5">
                        Already have an account?{' '}
                        <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
