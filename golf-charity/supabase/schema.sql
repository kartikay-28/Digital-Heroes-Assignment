-- Enable UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES (extends auth.users)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  handicap integer,
  charity_id uuid,
  charity_percent integer NOT NULL DEFAULT 10 CHECK (charity_percent >= 10 AND charity_percent <= 100),
  subscription_status text NOT NULL DEFAULT 'inactive'
    CHECK (subscription_status IN ('active','inactive','cancelled','past_due')),
  subscription_plan text CHECK (subscription_plan IN ('monthly','yearly')),
  stripe_customer_id text UNIQUE,
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- CHARITIES
CREATE TABLE charities (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url text,
  website_url text,
  is_featured boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  total_donated decimal(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add FK from profiles → charities
ALTER TABLE profiles ADD CONSTRAINT profiles_charity_fk
  FOREIGN KEY (charity_id) REFERENCES charities(id) ON DELETE SET NULL;

-- CHARITY EVENTS
CREATE TABLE charity_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  charity_id uuid NOT NULL REFERENCES charities(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  event_date date NOT NULL,
  location text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- SCORES (max 5 per user — enforced by trigger)
CREATE TABLE scores (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score >= 1 AND score <= 45),
  played_at date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Rolling 5-score trigger
CREATE OR REPLACE FUNCTION enforce_rolling_scores()
RETURNS TRIGGER AS $$
DECLARE
  score_count integer;
  oldest_id uuid;
BEGIN
  SELECT COUNT(*) INTO score_count FROM scores WHERE user_id = NEW.user_id;
  IF score_count >= 5 THEN
    SELECT id INTO oldest_id FROM scores
    WHERE user_id = NEW.user_id
    ORDER BY played_at ASC, created_at ASC LIMIT 1;
    DELETE FROM scores WHERE id = oldest_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER rolling_scores_trigger
  BEFORE INSERT ON scores
  FOR EACH ROW EXECUTE FUNCTION enforce_rolling_scores();

-- SUBSCRIPTIONS
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_subscription_id text UNIQUE NOT NULL,
  plan text NOT NULL CHECK (plan IN ('monthly','yearly')),
  amount decimal(8,2) NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','cancelled','past_due')),
  current_period_end timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- DRAWS
CREATE TABLE draws (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  year integer NOT NULL,
  drawn_numbers integer[] NOT NULL DEFAULT '{}',
  draw_type text NOT NULL DEFAULT 'random' CHECK (draw_type IN ('random','algorithm')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('simulation','pending','published')),
  prize_pool_total decimal(12,2) NOT NULL DEFAULT 0,
  jackpot_rolled_over boolean NOT NULL DEFAULT false,
  jackpot_amount decimal(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(month, year)
);

-- DRAW ENTRIES
CREATE TABLE draw_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id uuid NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  entry_numbers integer[] NOT NULL,
  match_count integer NOT NULL DEFAULT 0,
  tier integer CHECK (tier IN (3,4,5)),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(draw_id, user_id)
);

-- WINNERS
CREATE TABLE winners (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id uuid NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tier integer NOT NULL CHECK (tier IN (3,4,5)),
  prize_amount decimal(12,2) NOT NULL DEFAULT 0,
  proof_url text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected','paid')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- AUTO-CREATE PROFILE ON SIGNUP
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE charity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all" ON profiles FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins can update all" ON profiles FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Charities policies
CREATE POLICY "Anyone can view active charities" ON charities FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage charities" ON charities FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Charity events
CREATE POLICY "Anyone can view events" ON charity_events FOR SELECT USING (true);
CREATE POLICY "Admins can manage events" ON charity_events FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Scores policies
CREATE POLICY "Users can manage own scores" ON scores FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all scores" ON scores FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Subscriptions policies
CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all subscriptions" ON subscriptions FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Draws policies
CREATE POLICY "Anyone can view published draws" ON draws FOR SELECT USING (status = 'published');
CREATE POLICY "Admins can manage draws" ON draws FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Draw entries policies
CREATE POLICY "Users can view own entries" ON draw_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage entries" ON draw_entries FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Winners policies
CREATE POLICY "Users can view own winnings" ON winners FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upload proof" ON winners FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage winners" ON winners FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- SEED CHARITIES
INSERT INTO charities (name, description, image_url, website_url, is_featured, total_donated) VALUES
('Cancer Research UK', 'Dedicated to saving lives through research into the prevention, diagnosis and treatment of cancer.', 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600', 'https://cancerresearchuk.org', true, 12400.00),
('British Heart Foundation', 'Leading the fight against heart and circulatory diseases which kill 1 in 4 people in the UK.', 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600', 'https://bhf.org.uk', false, 8200.00),
('NSPCC', 'The UK leading children charity, preventing abuse and helping those affected to recover.', 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600', 'https://nspcc.org.uk', false, 6800.00),
('WWF UK', 'Working to stop the degradation of the planet natural environment and build a future in harmony with nature.', 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=600', 'https://wwf.org.uk', false, 4100.00),
('Age UK', 'We believe in a world where older people flourish — providing services and support in later life.', 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=600', 'https://ageuk.org.uk', false, 3900.00),
('Macmillan Cancer Support', 'Providing medical, emotional, practical and financial support to people affected by cancer.', 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600', 'https://macmillan.org.uk', false, 5600.00);