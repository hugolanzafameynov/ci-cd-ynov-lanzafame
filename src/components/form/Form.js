import {isValidName, isValidSurname, isValidEmail, isValidCity, isValidPostalCode, calculateAge} from '../../module';
import {useState, useEffect} from "react";

function Form({addUser}) {
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        email: '',
        birthDate: '',
        city: '',
        postalCode: ''
    });
    const [success, setSuccess] = useState({});
    const [errors, setErrors] = useState({});
    const [isValid, setIsValid] = useState(false);

    const validateField = (name, value) => {
        const newErrors = {...errors};

        switch (name) {
            case 'name':
                newErrors.name = isValidName({name: value}) ? '' : 'Nom de famille invalide';
                break;
            case 'surname':
                newErrors.surname = isValidSurname({surname: value}) ? '' : 'Prénom invalide';
                break;
            case 'email':
                newErrors.email = isValidEmail({email: value}) ? '' : 'Email invalide';
                break;
            case 'birthDate':
                newErrors.birthDate = calculateAge({birthDate: new Date(value)}) >= 18 ? '' : 'Vous devez avoir 18 ans minimum';
                break;
            case 'city':
                newErrors.city = isValidCity({city: value}) ? '' : 'Ville invalide';
                break;
            case 'postalCode':
                newErrors.postalCode = isValidPostalCode({postalCode: value}) ? '' : 'Code postal invalide';
                break;
            default:
                break;
        }

        setErrors(newErrors);
    };

    const handleChange = (e) => {
        const {name, value} = e.target;

        setFormData({
            ...formData,
            [name]: value
        });

        validateField(name, value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newErrors = {};

        let p = {
            name: formData.name,
            surname: formData.surname,
            email: formData.email,
            birthDate: new Date(formData.birthDate),
            city: formData.city,
            postalCode: formData.postalCode
        };

        if (!isValidName(p)) newErrors.name = 'Nom de famille invalide';
        if (!isValidSurname(p)) newErrors.surname = 'Prénom invalide';
        if (!isValidEmail(p)) newErrors.email = 'Email invalide';
        if (calculateAge(p) < 18) newErrors.birthDate = 'Vous devez avoir 18 ans minimum';
        if (!isValidCity(p)) newErrors.city = 'Ville invalide';
        if (!isValidPostalCode(p)) newErrors.postalCode = 'Code postal invalide';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            success.message = "";
            return;
        }

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        users.push(p);
        localStorage.setItem('users', JSON.stringify(users));
        setSuccess({message: "Enregistrement réussi !"});
        addUser(p);

        // Reset form data
        setFormData({
            name: '',
            surname: '',
            email: '',
            birthDate: '',
            city: '',
            postalCode: ''
        });
    };

    useEffect(() => {
        const isFormValid = Object.values(formData).every((value) => value !== "")
            && Object.values(errors).every(error => error === "");
        setIsValid(isFormValid);
    }, [formData, errors]);

    return (
        <form onSubmit={handleSubmit}>
            {success.message && <span className="success-message">{success.message}</span>}
            <div>
                <label htmlFor="name">Nom de famille :</label>
                <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                />
                {errors.name && <span className="error">{errors.name}</span>}
            </div>

            <div>
                <label htmlFor="surname">Prénom :</label>
                <input
                    id="surname"
                    type="text"
                    name="surname"
                    value={formData.surname}
                    onChange={handleChange}
                />
                {errors.surname && <span className="error">{errors.surname}</span>}
            </div>

            <div>
                <label htmlFor="email">Email :</label>
                <input
                    id="email"
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                />
                {errors.email && <span className="error">{errors.email}</span>}
            </div>

            <div>
                <label htmlFor="birthDate">Date de naissance :</label>
                <input
                    id="birthDate"
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                />
                {errors.birthDate && <span className="error">{errors.birthDate}</span>}
            </div>

            <div>
                <label htmlFor="city">Ville :</label>
                <input
                    id="city"
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                />
                {errors.city && <span className="error">{errors.city}</span>}
            </div>

            <div>
                <label htmlFor="postalCode">Code postal :</label>
                <input
                    id="postalCode"
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                />
                {errors.postalCode && <span className="error">{errors.postalCode}</span>}
            </div>

            <button type="submit" disabled={!isValid}>S'enregistrer</button>
        </form>
    );
}

export default Form;
