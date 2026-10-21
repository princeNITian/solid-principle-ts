# Everyday Indian Apps by Category

Descriptions are brief and based on what these apps are generally known for. Features change often, so check the app itself for current details. The last column suggests which SOLID example each app could inspire.

## Payments and Finance

| App | What it does | Good SOLID practice scenario |
|---|---|---|
| **PhonePe** | UPI payments, recharges, bill payments, insurance, mutual funds | L (payment limits), D (bank gateways) |
| **Google Pay** | UPI payments, bill splitting, rewards | O (reward rules) |
| **Paytm** | Wallet, UPI, recharges, ticket booking, banking | O (cashback offers) |
| **CRED** | Credit card bill payments with reward coins | O (reward types), S (bill flow) |
| **BHIM** | Government-backed UPI app | D (bank integrations) |
| **Zerodha Kite / Groww** | Stock and mutual fund investing | O (brokerage charges) |

## Food and Grocery Delivery

| App | What it does | Good SOLID practice scenario |
|---|---|---|
| **Swiggy** | Restaurant food delivery, plus Instamart for groceries | S (order flow), D (restaurant and rider services) |
| **Zomato** | Restaurant discovery, food delivery, table booking | I (customer, restaurant, rider roles) |
| **Blinkit** | 10-minute grocery and essentials delivery | S (stock, billing, rider assignment) |
| **Zepto** | Quick-commerce grocery delivery | O (fee and surge rules) |
| **BigBasket** | Scheduled grocery delivery | S (slot booking, substitution) |

## Travel and Transport

| App | What it does | Good SOLID practice scenario |
|---|---|---|
| **IRCTC Rail Connect** | Train ticket booking and PNR status | S (booking flow), O (Tatkal and quota rules) |
| **MakeMyTrip / Goibibo** | Flights, hotels, buses, trains | O (fare and convenience-fee rules) |
| **redBus** | Bus ticket booking | L (cancellation policies by operator) |
| **Ola / Uber / Rapido** | Cab, auto, and bike taxi rides | O (surge pricing), D (maps provider) |
| **Namma Yatri** | Auto-rickshaw booking with direct driver payment | D (payment and maps abstractions) |
| **Google Maps / MapMyIndia** | Navigation and local search | D (swappable map providers) |

## Shopping and E-commerce

| App | What it does | Good SOLID practice scenario |
|---|---|---|
| **Amazon India** | General marketplace | O (discount and coupon rules) |
| **Flipkart** | General marketplace, big sale events | O (sale pricing), S (checkout) |
| **Myntra** | Fashion and lifestyle shopping | L (return policies by product type) |
| **Meesho** | Reseller-focused marketplace | I (buyer vs. reseller capabilities) |
| **Nykaa** | Beauty and personal care | O (offers and bundles) |

## Entertainment and Media

| App | What it does | Good SOLID practice scenario |
|---|---|---|
| **JioHotstar** | Movies, shows, and live sports streaming | L (free vs. premium plans) |
| **Netflix / Prime Video** | Subscription video streaming | L (download permissions by plan) |
| **Spotify / JioSaavn / Gaana** | Music streaming | I (player vs. library vs. playlist features) |
| **BookMyShow** | Movie, event, and sports ticketing | L (cancellation rules), O (convenience fees) |
| **YouTube** | Video sharing and streaming | I (viewer vs. creator features) |

## Communication and Social

| App | What it does | Good SOLID practice scenario |
|---|---|---|
| **WhatsApp** | Messaging, calls, payments | D (message transport), I (chat vs. status vs. calls) |
| **Telegram** | Messaging and channels | I (bot vs. user capabilities) |
| **Instagram** | Photo and reel sharing | S (post upload, feed, notification) |
| **LinkedIn** | Professional networking and jobs | O (notification types) |
| **ShareChat / Moj** | Regional-language social and short video | O (content feed ranking rules) |

## Utilities and Productivity

| App | What it does | Good SOLID practice scenario |
|---|---|---|
| **Gmail** | Email | I (inbox, compose, settings screens) |
| **Google Drive** | Cloud file storage | L (read-only shared files) |
| **DigiLocker** | Government document storage | D (issuer integrations) |
| **Truecaller** | Caller ID and spam blocking | S (lookup, blocking, reporting) |
| **Google Keep / Notion** | Notes and task organization | O (note types and templates) |

## Health and Fitness

| App | What it does | Good SOLID practice scenario |
|---|---|---|
| **Practo** | Doctor appointments and consultations | S (booking, reminders, payments) |
| **1mg / PharmEasy** | Online medicine ordering | O (offer and coupon rules) |
| **HealthifyMe** | Calorie tracking and coaching | D (food database provider) |
| **Cult.fit** | Fitness classes and gyms | L (class booking rules by membership) |

## Education and Jobs

| App | What it does | Good SOLID practice scenario |
|---|---|---|
| **BYJU'S / Unacademy / PhysicsWallah** | Online learning and test prep | O (course and pricing plans) |
| **Duolingo** | Language learning | S (lesson, streak, notification logic) |
| **Naukri / Indeed** | Job search and hiring | I (job seeker vs. recruiter actions) |

## Government and Services

| App | What it does | Good SOLID practice scenario |
|---|---|---|
| **UMANG** | Single app for many central and state government services | D (service integrations) |
| **mAadhaar** | Aadhaar services on mobile | S (verification, download, update) |
| **FASTag / NHAI apps** | Toll payment and balance management | O (toll rules by vehicle class) |

## Home Services and Local Needs

| App | What it does | Good SOLID practice scenario |
|---|---|---|
| **Urban Company** | Home services like cleaning, salon, repairs | S (booking, pricing, professional assignment) |
| **JustDial** | Local business search | I (consumer vs. business features) |
| **NoBroker / MagicBricks** | Property rentals and sales | O (listing and fee rules) |

## How to use this table

- Pick one app from each category and build a mini feature (for example, "Urban Company booking" or "Rapido ride request").
- Write the naive version first, name the violated principle and its smell, then refactor.
- Good interview practice: choose an app you use daily, since you can explain the business story naturally.
