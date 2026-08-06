package com.collabsphere.collabsphere.service.impl;

import com.collabsphere.collabsphere.config.BrevoConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BrevoEmailService {

    private final BrevoConfig brevoConfig;

    private final RestTemplate restTemplate = new RestTemplate();

    public void sendEmail(
            String to,
            String toName,
            String subject,
            String htmlContent
    ) {

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        headers.set("api-key", brevoConfig.getApiKey());

        Map<String, Object> body = Map.of(

                "sender", Map.of(
                        "name", "CollabSphere",
                        "email", "surarshi006@gmail.com"
                ),

                "to", List.of(
                        Map.of(
                                "email", to,
                                "name", toName
                        )
                ),

                "subject", subject,

                "htmlContent", htmlContent
        );

        HttpEntity<Map<String, Object>> request =
                new HttpEntity<>(body, headers);

        try {

            System.out.println("========== BREVO REQUEST ==========");
            System.out.println("API KEY PRESENT = " + (brevoConfig.getApiKey() != null));
            System.out.println("API KEY LENGTH = " +
                    (brevoConfig.getApiKey() == null ? 0 : brevoConfig.getApiKey().length()));
            System.out.println("TO = " + to);
            System.out.println("SUBJECT = " + subject);

            ResponseEntity<String> response =
                    restTemplate.postForEntity(
                            "https://api.brevo.com/v3/smtp/email",
                            request,
                            String.class
                    );

            System.out.println("========== BREVO SUCCESS ==========");
            System.out.println("STATUS = " + response.getStatusCode());
            System.out.println("BODY = " + response.getBody());

        } catch (HttpStatusCodeException e) {

            System.out.println("========== BREVO HTTP ERROR ==========");
            System.out.println("STATUS = " + e.getStatusCode());
            System.out.println("BODY = " + e.getResponseBodyAsString());

            throw e;

        } catch (Exception e) {

            System.out.println("========== BREVO OTHER ERROR ==========");
            e.printStackTrace();

            throw new RuntimeException(e);
        }
    }
}