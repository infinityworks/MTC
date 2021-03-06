class ConfirmationPage < SitePrism::Page
  set_url '/sign-in-success'

  element :heading, '.aa-title-size'
  element :page_instructions, '.aa-lead-size', text: 'If this is you, please confirm.'
  element :first_name, "#first-name"
  element :last_name, "#last-name"
  element :school_name, "#school"
  element :dob, "#dob"
  element :come_back_message, ".aa-copy-size"
  element :back_sign_in_page, "a[href='/sign-out']"
  element :read_instructions,"button", text: 'Next'
  section :phase_banner, PhaseBanner, '.js-content .phase-banner'

  element :familiarisation_header, '#familiarisation-header-bar'
end
