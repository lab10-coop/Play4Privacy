# Helper script for retrieving bixcam updates once a second
# This way the bixcam server isn't affected by the load caused by this application
while true; do 
        ts="$(date +%s)000"
        echo "$ts"
        curl -s "http://bixcam.kunsthausgraz.at/out/stream/webcam2_x.jpg?$ts" > /var/www/play/bixcam.jpeg.new
        # mv is atomic (cp is not)
        mv -f /var/www/play/bixcam.jpeg.new /var/www/play/bixcam.jpeg
        sleep 1
done

