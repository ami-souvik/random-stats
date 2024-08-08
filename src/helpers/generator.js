import firstnames from "../mock/firstnames";
import lastnames from "../mock/lastnames";

export function generateNameNEmail() {
    let { name: firstname, gender } = firstnames[Math.floor((Math.random() * firstnames.length))]
    let lastname = lastnames[Math.floor((Math.random() * lastnames.length))]
    let ext = `${Math.floor((Math.random() * 10))}${Math.floor((Math.random() * 10))}${Math.floor((Math.random() * 10))}${Math.floor((Math.random() * 10))}`
    let email = `${firstname}${lastname}${ext}@gmail.com`
    firstname = firstname.charAt(0).toUpperCase() + firstname.slice(1)
    lastname = lastname.charAt(0).toUpperCase() + lastname.slice(1)
    return {
        fullname: `${firstname} ${lastname}`,
        email: email,
        gender: gender == 'm' ? 'Male' : 'Female'
    }
}

export function generateRandomStats(questions, num) {
    var generation = []
    for(let i=0; i<num; i++) {
        const { fullname, email, gender } = generateNameNEmail()
        generation.push([
            fullname,
            email,
            gender,
            ...questions.map(q => {
                return q.choices[Math.floor((Math.random() * q.choices.length))]
            })
        ])
    }
    return generation;
}