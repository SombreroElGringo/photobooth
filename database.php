<?php

# Create the table in the database if it does not exist
function initialiaze_db() {
  global $wpdb;
  require_once ABSPATH . 'wp-admin/includes/upgrade.php';
  $TABLENAME = "{$wpdb->prefix}photobooth";

  $SQL_CREATE = "CREATE TABLE {$TABLENAME} (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(255) NOT NULL,
    filepath VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )";

  maybe_create_table($TABLENAME, $SQL_CREATE);

  $wpdb->flush();
}

# Insert the row in the database
function insert_photobooth($type, $filepath, $filename) {
  global $wpdb;
  $TABLENAME = "{$wpdb->prefix}photobooth";
  $wpdb->insert($TABLENAME, array(
    'user_id' => get_current_user_id(),
    'type' => $type,
    'filepath' => $filepath,
    'filename' => $filename
    )
  );
  $wpdb->flush();
}

# Select the last overlay uploaded by the user
function get_overlay($type) {
  global $wpdb;
  $TABLENAME = "{$wpdb->prefix}photobooth";
  $USER_ID = get_current_user_id();

  $photobooth = $wpdb->get_row(
    $wpdb->prepare("
      SELECT filepath
      FROM $TABLENAME
      WHERE user_id='{$USER_ID}'
      AND type='{$type}'
      ORDER BY created_at DESC
      LIMIT 1
    ")
  );
  $wpdb->flush();
  return $photobooth->filepath;
}

?>
