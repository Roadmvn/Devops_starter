# Différences entre les Configurations d'Environnement

Ce document explique les principales différences entre `.env.example` (développement) et `.env.test` (test).

## 1. Configuration du Serveur 🖥️

| Variable | Development | Test | Raison |
|----------|------------|------|---------|
| PORT | 3000 | 3001 | Évite les conflits de ports lors de l'exécution simultanée |
| NODE_ENV | development | test | Détermine le mode d'exécution de l'application |

## 2. Base de Données 💾

| Variable | Development | Test | Raison |
|----------|------------|------|---------|
| DB_NAME | devops_starter | devops_starter_test | Sépare les données de test des données de développement |
| DB_USER | postgres | test_user | Utilise un utilisateur dédié aux tests |
| DB_PASSWORD | your_password | test_password | Credentials simplifiées pour les tests |

## 3. Configuration Email 📧

| Development | Test |
|------------|------|
| SMTP réel (Gmail) | Ethereal Email (service de test) |
| Credentials réelles | Credentials de test |
| Emails réellement envoyés | Emails capturés pour test |

```diff
- SMTP_HOST=smtp.gmail.com
+ SMTP_HOST=smtp.ethereal.email
```

## 4. Rate Limiting 🚦

| Aspect | Development | Test | Raison |
|--------|------------|------|---------|
| Fenêtre globale | 15 minutes | 1 minute | Tests plus rapides |
| Requêtes max | 100 | 1000 | Évite les blocages pendant les tests |
| Tentatives auth | 5 | 100 | Permet plus de tests d'authentification |

## 5. Logging 📝

| Variable | Development | Test | Raison |
|----------|------------|------|---------|
| LOG_LEVEL | info | debug | Plus de détails pour le débogage des tests |
| LOG_FILE_PATH | app.log | test.log | Sépare les logs de test |

## 6. Tokens JWT 🔑

| Development | Test |
|------------|------|
| Secrets complexes | Secrets simplifiés pour les tests |
| Durées standards | Mêmes durées que le développement |

## 7. OAuth Google 🔄

| Development | Test |
|------------|------|
| Vraies credentials Google | Credentials fictives pour les tests |
| Port 3000 dans les callbacks | Port 3001 dans les callbacks |

## Bonnes Pratiques 👍

1. **Séparation des Environnements**
   - Base de données distincte
   - Ports différents
   - Fichiers de logs séparés

2. **Sécurité**
   - Pas de vraies credentials en test
   - Valeurs de test clairement identifiées
   - Secrets simplifiés mais fonctionnels

3. **Tests Efficaces**
   - Rate limiting adapté aux tests
   - Logging plus détaillé
   - Services de test (Ethereal) pour les emails

4. **Maintenance**
   - Structure identique entre les fichiers
   - Commentaires explicatifs
   - Variables clairement nommées
