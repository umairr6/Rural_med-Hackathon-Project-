-- Non-sensitive village lookup seeds for a hackathon prototype.
-- This seed intentionally includes no real pharmacies, inventory, patients or medicines.
insert into public.villages(region,district,name) values
('Kashmir','Baramulla','Sopore'),
('Kashmir','Baramulla','Pattan'),
('Kashmir','Baramulla','Uri'),
('Kashmir','Baramulla','Rafiabad'),
('Kashmir','Baramulla','Baramulla town'),
('Kashmir','Kupwara','Kupwara town'),
('Kashmir','Kupwara','Handwara'),
('Kashmir','Kupwara','Langate'),
('Kashmir','Srinagar','Srinagar city'),
('Kashmir','Srinagar','Harwan'),
('Kashmir','Srinagar','Zakura'),
('Jammu','Jammu','Jammu city'),
('Jammu','Jammu','Akhnoor'),
('Jammu','Jammu','R S Pura'),
('Jammu','Doda','Doda town'),
('Jammu','Doda','Bhaderwah'),
('Jammu','Kathua','Kathua town')
on conflict(region,district,name) do nothing;
