const cacheName = 'v2';

//call install event
self.addEventListener('install', e =>{
    console.log('Service Worker: Installed');
});

//call activate event
self.addEventListener('activate', e =>{
    console.log('Service Worker: Activated');
    //remove unwanted caches
    e.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache =>{
                    if(cache !== cacheName){
                        console.log('Service worker : Clearing Old Cache');
                        return caches.delete(cache);
                    }
                })
            )
        })
    );
});

//call fetch event
self.addEventListener('fetch', e => {
    console.log('Service Worker: Fetching');
    e.respondWith(
        fetch(e.request)
        .then(res=>{
            // Make copy off response
            const resClone = res.clone();
            //open cache
            caches
            .open(cacheName).then(cache =>{
                //add response to cache
                cache.put(e.request, resClone);
            });
            return res;
        }).catch(err => caches.match(e.request).then(res => res))
    )
})


const urlBase64ToUint8Array = base64String => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
}

const saveSubscription = async (subscription) => {
    const response = await fetch('http://localhost:3000/save-subscription', {
        method: 'post',
        headers: { 'Content-type': "application/json" },
        body: JSON.stringify(subscription)
    })

    return response.json()
}

self.addEventListener("activate", async (e) => {
    const subscription = await self.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array("YOUR_PUBLIC_KEY")
    })

    const response = await saveSubscription(subscription)
    console.log(response)
})

self.addEventListener("push", e => {
    self.registration.showNotification("Wohoo!!", { body: e.data.text() })
})