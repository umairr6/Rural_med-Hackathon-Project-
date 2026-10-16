-- Non-sensitive village lookup seeds for a hackathon prototype.
-- This seed intentionally includes no real pharmacies, inventory, patients or medicines.
insert into public.villages(region,district,name) values
('Kashmir','Baramulla','Sopore'),
('Kashmir','Baramulla','Pattan'),
('Kashmir','Baramulla','Uri'),
('Kashmir','Baramulla','Baramulla town'),
('Kashmir','Kupwara','Kupwara town'),
('Kashmir','Kupwara','Handwara'),
('Kashmir','Srinagar','Srinagar city'),
('Jammu','Jammu','Jammu city'),
('Jammu','Doda','Doda town'),
('Jammu','Kathua','Kathua town')
on conflict(region,district,name) do nothing;
