import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, query, place_id, location, radius = 5000 } = await req.json();

    let result;

    switch (action) {
      case 'places_search':
        const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`;
        const searchResponse = await fetch(searchUrl);
        result = await searchResponse.json();
        break;

      case 'place_details':
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=name,formatted_address,formatted_phone_number,website,rating,reviews,opening_hours,geometry&key=${GOOGLE_API_KEY}`;
        const detailsResponse = await fetch(detailsUrl);
        result = await detailsResponse.json();
        break;

      case 'nearby_search':
        const nearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=${radius}&keyword=${encodeURIComponent(query || '')}&key=${GOOGLE_API_KEY}`;
        const nearbyResponse = await fetch(nearbyUrl);
        result = await nearbyResponse.json();
        break;

      case 'geocode':
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`;
        const geocodeResponse = await fetch(geocodeUrl);
        result = await geocodeResponse.json();
        break;

      case 'reverse_geocode':
        const reverseUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.lat},${location.lng}&key=${GOOGLE_API_KEY}`;
        const reverseResponse = await fetch(reverseUrl);
        result = await reverseResponse.json();
        break;

      case 'directions':
        const { origin, destination, mode = 'driving' } = await req.json();
        const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=${mode}&key=${GOOGLE_API_KEY}`;
        const directionsResponse = await fetch(directionsUrl);
        result = await directionsResponse.json();
        break;

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update integration usage
    try {
      const integrations = await base44.asServiceRole.entities.Integration.filter({ integration_key: 'google_maps' });
      if (integrations.length > 0) {
        await base44.asServiceRole.entities.Integration.update(integrations[0].id, {
          last_used: new Date().toISOString(),
          usage_count: (integrations[0].usage_count || 0) + 1,
          status: 'active'
        });
      }
    } catch (e) {
      console.error('Failed to update integration stats:', e);
    }

    return Response.json({ success: true, ...result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});