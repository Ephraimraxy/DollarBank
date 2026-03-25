import fs from 'fs';
const file = 'd:\\Junks\\TODAY\\vault\\components\\Admin.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/Save,/g, 'Check,');
content = content.replace(/<Save /g, '<Check ');

content = content.replace(/Shield,/g, 'ShieldCheck,');
content = content.replace(/<Shield /g, '<ShieldCheck ');

content = content.replace(/Users,/g, 'User,');
content = content.replace(/<Users /g, '<User ');

content = content.replace(/XCircle,/g, ''); 
content = content.replace(/<XCircle /g, '<X ');

content = content.replace(/DollarSign,/g, ''); 
content = content.replace(/<DollarSign /g, '<CreditCard ');

content = content.replace(/Activity,/g, ''); 
content = content.replace(/<Activity /g, '<Clock ');

content = content.replace(/Filter,/g, '');
content = content.replace(/BarChart3,/g, ''); 
content = content.replace(/<BarChart3 /g, '<PieChart ');

fs.writeFileSync(file, content);
console.log('Fixed icons in Admin.tsx');
