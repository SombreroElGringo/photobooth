<?php
/**
 * @package Photobooth
 * @version 1.0.2
 */
/*
Plugin Name: Photobooth
Plugin URI: http://wordpress.org/plugins/hello-dolly/
Description: this plugin allows to activate the shortcut [photobooth]. This shortcut will implement a component to be able to take a selfie by following some overlay rules; once taken, it will use the photo taken as a new overlay.
Author: SombreroElGringo
Version: 1.0.0
Author URI: https://github.com/SombreroElGringo/photobooth
*/

# Define current location
define('PLUGIN_DIR', plugin_dir_path(__FILE__));
require_once(PLUGIN_DIR . 'database.php');

$SHORTCODE = 'photobooth';

function init($shortcode_atts) {
  initialiaze_db();

  $atts = shortcode_atts(array(
    'type' => 'default',
    'default_overlay' => ''
   ), $shortcode_atts);

  $uuid = uniqid();
  $user_overlay = get_overlay($atts['type']);
  $overlay = is_null($user_overlay) ?
    $atts['default_overlay'] : $user_overlay;

  return generate_html($uuid, $atts['type'], $overlay);
}

function generate_html($uuid, $type, $overlay) {
  return "
    <div id='{$uuid}' class='photobooth'>
      <div class='photobooth__camera'>
        <video
          id='{$uuid}_camera'
          class='photobooth__video'
          muted autoplay playsinline
          >
          Video stream not available
        </video>
        <img
          id='{$uuid}_overlay'
          class='photobooth__overlay'
          src='{$overlay}'
          alt='overlay'
        />
        <canvas id='{$uuid}_output' class='photobooth__output'></canvas>
      </div>
      <div id='{$uuid}_info' class='photobooth__info'></div>
      <div class='photobooth__buttons'>
        <button id='{$uuid}_take' class='photobooth__button'>Take photo</button>
        <button id='{$uuid}_retake' class='photobooth__button'>Retake photo</button>
        <button id='{$uuid}_save' class='photobooth__button'>Save</button>
      </div>
    </div>
    <script src='https://webrtc.github.io/adapter/adapter-latest.js'></script>
    <script type='text/javascript'>
      photobooth.initialize('{$uuid}', '{$type}');
    </script>
  ";
}

function save_photobooth() {
  $type = $_POST["type"];
  $photo = $_POST["photo"];
  if (!is_null($photo) && !is_null($type)) {
    upload_photo($type, $photo);
  }
  echo 'success';
  wp_die();
}

function upload_photo($type, $photo) {
  $wp_upload_dir = wp_upload_dir();
  $user_id = get_current_user_id();
  $today = date('Y-m-d_H:i:s');
  $project = 'photobooth';

  $upload_folder = "{$wp_upload_dir['basedir']}/{$project}/{$user_id}/{$type}";
  $filename = "${user_id}_{$type}_{$today}.png";
  $url = parse_url("{$wp_upload_dir['baseurl']}/{$project}/{$user_id}/{$type}/{$filename}");
  $filepath = $url["path"];

  if (!file_exists($upload_folder)) {
    mkdir($upload_folder, 0755, true);
  }

  list($photo_type, $photo) = explode(';', $photo);
  list(, $photo) = explode(',', $photo);
  $photo = base64_decode($photo);

  file_put_contents("{$upload_folder}/{$filename}", $photo);
  insert_photobooth($type, $filepath, $filename);
}

function my_enqueue() {
  wp_enqueue_style('style', plugin_dir_url(__FILE__).'styles.css');
  wp_enqueue_script('ajax-script', plugin_dir_url(__FILE__).'script.js', array('jquery'));
  wp_localize_script('ajax-script', 'AjaxObject', array('url' => admin_url('admin-ajax.php')));
}

add_shortcode($SHORTCODE, 'init');
add_action( 'wp_enqueue_scripts', 'my_enqueue' );
add_action('wp_ajax_save_photobooth', 'save_photobooth');
add_action('wp_ajax_nopriv_save_photobooth', 'save_photobooth');

?>
