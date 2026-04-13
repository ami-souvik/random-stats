import firstnames from '../mock/firstnames';
import lastnames from '../mock/lastnames';
import { Question } from '../store/slice/dataSlice';

export function generateNameNEmail() {
  let { name: firstname, gender } = firstnames[Math.floor(Math.random() * firstnames.length)];
  let lastname = lastnames[Math.floor(Math.random() * lastnames.length)];
  let ext = `${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}`;
  let email = `${firstname}${lastname}${ext}@gmail.com`;
  firstname = firstname.charAt(0).toUpperCase() + firstname.slice(1);
  lastname = lastname.charAt(0).toUpperCase() + lastname.slice(1);
  return {
    fullname: `${firstname} ${lastname}`,
    email: email,
    gender: gender == 'm' ? 'Male' : 'Female',
  };
}

export function generateRandomStats(questions: Question[], num: number): any[][] {
  var generation: any[][] = [];
  for (let i = 0; i < num; i++) {
    const person = generateNameNEmail();

    generation.push(
      questions.map((q) => {
        switch (q.type) {
          case 'name':
            return person.fullname;
          case 'email':
            return person.email;
          case 'gender':
            if (q.title === 'Gender' && q.choices?.includes('Male')) {
              return person.gender;
            }
            return q.choices ? q.choices[Math.floor(Math.random() * q.choices.length)] : '';
          case 'number':
            const min = Number(q.min) || 0;
            const max = Number(q.max) || 100;
            const multiplier = Number(q.multiplier) || 1;
            return Math.floor(Math.random() * (max - min + 1) + min) * multiplier;
          case 'auto_number':
            return (q.prefix || '') + (i + 1);
          default:
            if (!q.choices || q.choices.length === 0) return '';
            return q.choices[Math.floor(Math.random() * q.choices.length)];
        }
      })
    );
  }
  return generation;
}
