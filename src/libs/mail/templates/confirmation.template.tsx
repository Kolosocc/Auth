import React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Link,
  Text,
} from '@react-email/components';

interface ConfirmationTemplateProps {
  domain: string;
  token: string;
}

export function ConfirmationTemplate({
  domain,
  token,
}: ConfirmationTemplateProps) {
  const confirmLink = `${domain}/auth/new-verification?token=${token}`;

  return (
    <Html>
      <Head />
      <Body
        style={{
          backgroundColor: '#f3f4f6',
          fontFamily: 'Arial, sans-serif',
          margin: 0,
          padding: '40px',
        }}
      >
        <Container
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            padding: '24px',
            maxWidth: '600px',
            margin: '40px auto',
          }}
        >
          <Heading
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '16px',
            }}
          >
            Confirm your email
          </Heading>

          <Text
            style={{ fontSize: '16px', color: '#374151', marginBottom: '24px' }}
          >
            Please confirm your email by clicking the button below:
          </Text>

          <Link
            href={confirmLink}
            style={{
              display: 'inline-block',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 'bold',
            }}
          >
            Confirm email
          </Link>

          <Text
            style={{ fontSize: '14px', color: '#6b7280', marginTop: '24px' }}
          >
            This link will expire in 24 hours. If you did not create this
            account, you can ignore this email.
          </Text>

          <Text
            style={{ fontSize: '14px', color: '#9ca3af', marginTop: '12px' }}
          >
            Thank you for using our service
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
