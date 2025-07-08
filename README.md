# Simulateur de Dons - Réductions d'Impôts

Un simulateur web autonome pour calculer les réductions d'impôts liées aux dons, conformément aux articles 200 et 238 bis du Code Général des Impôts (CGI).

## Fonctionnalités

- Simulation pour les particuliers (art. 200 CGI)
  - Taux de réduction : 66% ou 75% selon le type d'organisme
  - Plafond de 20% du revenu imposable
  - Plafond spécial de 1000€ pour les dons aux organismes d'aide aux personnes en difficulté
  
- Simulation pour les entreprises (art. 238 bis CGI)
  - Taux de réduction : 60% jusqu'à 2M€, 40% au-delà
  - Plafond : 20 000€ ou 0,5% du CA HT (le plus élevé des deux)
  - Calcul de l'IS avant/après réduction
  - Gestion du report sur 5 ans

## Installation

Aucune installation n'est nécessaire. Le simulateur fonctionne entièrement dans le navigateur.

1. Ouvrez le fichier `index.html` dans votre navigateur
2. Ou servez les fichiers via un serveur web local :
   ```bash
   python -m http.server 8000
   # Puis visitez http://localhost:8000
   ```

## Utilisation

1. Sélectionnez votre profil (Particulier ou Entreprise)
2. Choisissez le type d'organisme bénéficiaire
3. Renseignez le montant du don
4. Complétez les informations spécifiques à votre situation :
   - Particulier : revenu imposable, date d'exercice
   - Entreprise : CA HT, impôt dû avant réduction
5. Cliquez sur "Calculer" pour obtenir les résultats

## Résultats fournis

- Taux de réduction applicable
- Montant de la réduction d'impôt
- Plafonds applicables
- Excédent reportable
- Graphique comparatif coût brut/net
- Pour les entreprises : impact sur l'IS

## Aspects techniques

- HTML5/CSS3/JavaScript pur
- Responsive design avec Bootstrap 5
- Graphiques avec Chart.js
- Tests unitaires intégrés
- Calculs conformes aux articles 200 et 238 bis du CGI

## Avertissement

Les résultats fournis sont purement indicatifs et ne constituent pas une consultation fiscale. Pour toute question juridique ou fiscale, consultez un professionnel qualifié.

## Licence

MIT 