<?php
/**
 * @package Photobooth
 * @version 2.2.2
 */
/*
Plugin Name: Photobooth
Plugin URI: https://github.com/SombreroElGringo/photobooth
Description: this plugin allows to activate the shortcut [photobooth]. This shortcut will implement a component to be able to take a selfie by following some overlay rules; once taken, it will use the photo taken as a new overlay.
Author: SombreroElGringo
Version: 2.2.2
Author URI: https://github.com/SombreroElGringo/photobooth
*/

# Define current location
define('PLUGIN_DIR', plugin_dir_path(__FILE__));
require_once(PLUGIN_DIR . 'database.php');

function init($shortcode_atts) {
  init_db();
  $atts = shortcode_atts(array(
    'types' => array('default'),
    'overlays' => array(),
   ), $shortcode_atts);

  $no_whitespaces_types = preg_replace( '/\s*,\s*/', ',', filter_var($atts['types'], FILTER_SANITIZE_STRING ));
  $no_whitespaces_overlays = preg_replace( '/\s*,\s*/', ',', filter_var($atts['overlays'], FILTER_SANITIZE_STRING ));
  $types = explode(',', $no_whitespaces_types);
  $overlays= explode(',', $no_whitespaces_overlays);

  return generate_html($types, $overlays);
}

function get_default_overlay($type, $overlay) {
  $user_overlay = get_overlay($type);
  $result = is_null($user_overlay) ?
    $overlay : $user_overlay;
  return $result;
}

function get_select_options($types) {
  $options = "";
  foreach($types as $key => $value ) {
   $options .= "<option value={$value}>{$value}</option>";
  }
  return $options;
}

function generate_html($types, $overlays) {
  $uuid = uniqid();
  $user_id = get_current_user_id();
  $overlay = get_default_overlay($types[0], $overlays[0]);

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
        <div id='{$uuid}_spinner' class='lds-ring'>
          <div></div><div></div><div></div><div></div>
        </div>
      </div>
      <div id='{$uuid}_info' class='photobooth__info'></div>
      <div>
        <select id='{$uuid}_select' class='photobooth__select'>".get_select_options($types)."</select>
      </div>
      <div class='photobooth__buttons'>
        <button id='{$uuid}_take' class='photobooth__button'>Take photo</button>
        <button id='{$uuid}_mobile_camera' class='photobooth__button' data-current-camera='user'>Back camera</button>
        <button id='{$uuid}_retake' class='photobooth__button'>Retake photo</button>
        <button id='{$uuid}_save' class='photobooth__button'>Save</button>
      </div>
    </div>
    <script src='https://webrtc.github.io/adapter/adapter-latest.js'></script>
    <script type='text/javascript'>
      photobooth.initialize('{$uuid}', '{$user_id}', ".json_encode($overlays).");
    </script>
  ";
}

function save_photo() {
  $type = $_POST["type"];
  $photo = $_POST["photo"];
  if (!is_null($photo) && !is_null($type)) {
    upload_photo($type, $photo);
  }
  echo 'success';
  wp_die();
}

function generate_path($dir, $user_id, $type) {
  return "{$dir}/photobooth/{$user_id}/{$type}";
}

function upload_photo($type, $photo) {
  $upload_dir = wp_upload_dir();
  $user_id = get_current_user_id();
  $today = date('Y-m-d_H:i:s');

  $filename = "${user_id}_{$type}_{$today}.png";
  $url = parse_url(generate_path($upload_dir['baseurl'], $user_id, $type) . "/{$filename}");
  $upload_folder = generate_path($upload_dir['basedir'], $user_id, $type);

  if (!file_exists($upload_folder)) {
    mkdir($upload_folder, 0755, true);
  }

  list($photo_type, $photo) = explode(';', $photo);
  list(, $photo) = explode(',', $photo);
  $photo = base64_decode($photo);

  file_put_contents("{$upload_folder}/{$filename}", $photo);
  insert_db($type, $url['path'], $filename);
}

function get_photo() {
  $type = $_GET["type"];
  if (!is_null($type)) {
    echo get_overlay($type);
  }
  wp_die();
}

function my_enqueue() {
  wp_enqueue_style('style', plugin_dir_url(__FILE__).'styles.css');
  wp_enqueue_script('ajax-script', plugin_dir_url(__FILE__).'script.js', array('jquery'));
  wp_localize_script('ajax-script', 'AjaxObject', array('url' => admin_url('admin-ajax.php')));
}

add_shortcode('photobooth', 'init');
// Load scripts
add_action( 'wp_enqueue_scripts', 'my_enqueue' );
// Ajax
add_action('wp_ajax_save_photo', 'save_photo');
add_action('wp_ajax_nopriv_save_photo', 'save_photo');

add_action('wp_ajax_get_photo', 'get_photo');
add_action('wp_ajax_nopriv_get_photo', 'get_photo');

?>
