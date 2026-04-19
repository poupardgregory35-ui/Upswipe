-- PHASE 2.2: DATA SEEDING
-- Insert 10 realistic job offers for the Demo Feed.

INSERT INTO jobs (title, company, city, salary, type, required_license) VALUES
('Ambulancier DEA - Nuit', 'Jussieu Secours', 'Rennes', 2400, 'CDD', 'D'),
('Chauffeur VSL', 'Taxi Ouest', 'Brest', 1900, 'CDI', 'B'),
('Régulateur SAMU', 'Urgences 35', 'Saint-Malo', 2100, 'Interim', 'B'),
('Auxiliaire Ambulancier', 'Ambulances Martin', 'Rennes', 2200, 'CDI', 'B'),
('Ambulancier DEA - Jour', 'SARL TransVie', 'Vannes', 2500, 'CDI', 'D'),
('Chauffeur VSL - Week-end', 'Ambulances Armor', 'Lorient', 2000, 'CDD', 'B'),
('Ambulancier SMUR', 'CHU Rennes', 'Rennes', 2800, 'CDI', 'D'),
('Régulateur - Temps partiel', 'Centre 15', 'Brest', 1800, 'CDD', 'B'),
('Auxiliaire - Remplacement', 'SOS Médecins', 'Quimper', 2100, 'Interim', 'B'),
('Ambulancier Bariatrique', 'Ambulances Plus', 'Rennes', 2600, 'CDI', 'D');
