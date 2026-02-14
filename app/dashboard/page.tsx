'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function BoursePage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [isAvailable, setIsAvailable] = useState(true); // État local
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        // 1. Vérification Auth
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/');
          return;
        }

        // 2. Récupération Profil
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        // 3. Gestion des cas limites (Profil inexistant ou incomplet)
        if (error || !data) {
          console.log("Profil non trouvé, redirection setup...");
          router.push('/setup-profil');
          return;
        }

        // ⚠️ SWITCH RECRUTEUR (Detection automatique)
        if (data.recruiter_company_name) {
          console.log("Compte Recruteur détecté -> Redirection");
          router.push('/recruiter/dashboard');
          return;
        }

        // Si le profil existe mais n'a pas de téléphone (cas Google Login frais)
        if (!data.phone) {
          console.log("Profil incomplet (pas de tel), redirection setup...");
          router.push('/setup-profil');
          return;
        }

        setProfile(data);
        setIsAvailable(data.is_available);
        setLoading(false);

      } catch (err) {
        console.error("Erreur chargement dashboard:", err);
        setLoading(false); // On débloque pour afficher l'erreur
      }
    };
    init();
  }, [router, supabase]);

  // Fonction du bouton ON/OFF
  const toggleStatus = async () => {
    setUpdating(true);
    const newState = !isAvailable;

    // Mise à jour immédiate dans Supabase
    const { error } = await supabase
      .from('profiles')
      .update({ is_available: newState })
      .eq('id', profile.id);

    if (!error) {
      setIsAvailable(newState); // Mise à jour visuelle si succès
    } else {
      alert("Erreur de connexion");
    }
    setUpdating(false);
  };

  if (loading) return <div className="p-10 text-center animate-pulse">Chargement de ton espace...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-6">

        {/* En-tête Profil */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mon Statut 🚑</h1>
            <p className="text-gray-500 font-medium">{profile.phone}</p>
          </div>
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
            {profile.diploma}
          </span>
        </div>

        {/* LE GROS BOUTON D'ACTION */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">

          <a
            href="/candidate/swipe"
            className="block w-full bg-cyan-400 text-black px-6 py-3 rounded-xl font-bold hover:bg-cyan-500 mb-6 transition-colors shadow-sm"
          >
            Voir les offres disponibles →
          </a>

          <p className="text-gray-600 mb-4 font-medium">Ta visibilité actuelle :</p>

          <button
            onClick={toggleStatus}
            disabled={updating}
            className={`w-full py-6 rounded-xl font-black text-lg transition-all transform active:scale-95 shadow-md flex items-center justify-center gap-3 ${isAvailable
              ? 'bg-green-500 hover:bg-green-600 text-white ring-4 ring-green-100'
              : 'bg-gray-800 hover:bg-gray-900 text-white ring-4 ring-gray-200'
              }`}
          >
            {updating ? 'Mise à jour...' : (
              isAvailable ? (
                <>
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                  </span>
                  JE SUIS DISPONIBLE
                </>
              ) : (
                '⛔ JE NE CHERCHE PLUS'
              )
            )}
          </button>

          <p className="mt-4 text-sm text-gray-500">
            {isAvailable
              ? "✅ Les recruteurs peuvent voir ton numéro."
              : "❌ Ton profil est masqué. Tu es tranquille."}
          </p>
        </div>

        {/* Services Académie REMOVED */}

        {/* Bouton Déconnexion */}
        <button
          onClick={() => supabase.auth.signOut().then(() => router.push('/'))}
          className="w-full text-center text-gray-400 text-sm hover:text-gray-600 transition"
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
