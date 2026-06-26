import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// TODO: Remplacer par vos vraies informations Supabase
const supabaseUrl = 'https://kszpipufukdqkgwpdhkp.supabase.co';
const supabaseAnonKey = 'sb_publishable_piEq6gIynPC6ZrZiylda3Q_vAlKXgn9';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
